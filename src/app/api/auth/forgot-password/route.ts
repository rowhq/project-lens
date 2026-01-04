import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { randomBytes } from "crypto";
import { sendPasswordReset } from "@/shared/lib/resend";
import {
  strictRateLimiter,
  checkRateLimit,
  getClientIP,
} from "@/server/lib/ratelimit";

export async function POST(req: Request) {
  // Strict rate limiting: 3 requests per hour
  const ip = getClientIP(req);
  const rateLimitResponse = await checkRateLimit(strictRateLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email
    await sendPasswordReset({
      email: user.email,
      userName: user.firstName,
      resetToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
