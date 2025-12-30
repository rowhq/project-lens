import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { dispatchEngine } from "@/server/services/dispatch-engine";
import { prisma } from "@/server/db/prisma";

// Verify Vercel cron secret
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  // Verify cron secret if in production
  if (process.env.NODE_ENV === "production" && CRON_SECRET) {
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = {
    timestamp: new Date().toISOString(),
    tasks: {} as Record<string, unknown>,
  };

  try {
    // Task 1: Check SLAs and escalate breaches
    const slaResult = await dispatchEngine.checkSLAs();
    results.tasks.slaCheck = {
      breached: slaResult.breached,
      escalated: slaResult.escalated,
    };

    // Task 2: Auto-dispatch pending jobs
    const pendingJobs = await prisma.job.findMany({
      where: {
        status: "PENDING_DISPATCH",
        createdAt: {
          lte: new Date(Date.now() - 5 * 60 * 1000), // Older than 5 minutes
        },
      },
      take: 10,
    });

    let dispatched = 0;
    for (const job of pendingJobs) {
      const result = await dispatchEngine.dispatch(job.id);
      if (result.success) dispatched++;
    }
    results.tasks.autoDispatch = { pending: pendingJobs.length, dispatched };

    // Task 3: Send reminder notifications
    const remindersResult = await sendReminders();
    results.tasks.reminders = remindersResult;

    // Task 4: Clean up expired share tokens
    const cleanupResult = await cleanupExpiredTokens();
    results.tasks.cleanup = cleanupResult;

    // Task 5: Calculate daily metrics
    const metricsResult = await calculateDailyMetrics();
    results.tasks.metrics = metricsResult;

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function sendReminders(): Promise<{ sent: number }> {
  // Find jobs approaching SLA deadline
  const atRiskJobs = await prisma.job.findMany({
    where: {
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
      slaDueAt: {
        gte: new Date(),
        lte: new Date(Date.now() + 4 * 60 * 60 * 1000), // Due in next 4 hours
      },
    },
    include: {
      property: true,
    },
  });

  let sent = 0;

  for (const job of atRiskJobs) {
    if (!job.assignedAppraiserId) continue;

    // Check if reminder already sent recently
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId: job.assignedAppraiserId,
        type: "SLA_REMINDER",
        data: { path: ["jobId"], equals: job.id },
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // Last 2 hours
      },
    });

    if (existingReminder) continue;

    // Create reminder notification
    await prisma.notification.create({
      data: {
        userId: job.assignedAppraiserId,
        type: "SLA_REMINDER",
        title: "Job Due Soon",
        body: `Your job at ${job.property?.addressFull || job.property?.addressLine1} is due in less than 4 hours.`,
        data: { jobId: job.id },
        channel: "push",
      },
    });

    sent++;
  }

  return { sent };
}

async function cleanupExpiredTokens(): Promise<{ cleaned: number }> {
  // Clean up expired API keys
  const result = await prisma.apiKey.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return { cleaned: result.count };
}

async function calculateDailyMetrics(): Promise<{ saved: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get daily stats
  const [
    newRequests,
    completedReports,
    totalRevenue,
    newAppraisers,
    activeJobs,
  ] = await Promise.all([
    prisma.appraisalRequest.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.report.count({
      where: { generatedAt: { gte: today, lt: tomorrow } },
    }),
    prisma.payment.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: "COMPLETED",
        type: "CHARGE",
      },
      _sum: { amount: true },
    }),
    prisma.appraiserProfile.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.job.count({
      where: { status: { in: ["ACCEPTED", "IN_PROGRESS"] } },
    }),
  ]);

  // Store in audit log for reporting
  await prisma.auditLog.create({
    data: {
      resource: "SYSTEM",
      resourceId: "daily-metrics",
      action: "DAILY_METRICS",
      metadata: {
        date: today.toISOString(),
        newRequests,
        completedReports,
        totalRevenue: totalRevenue._sum.amount || 0,
        newAppraisers,
        activeJobs,
      },
    },
  });

  return { saved: true };
}
