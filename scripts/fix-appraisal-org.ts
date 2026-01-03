/**
 * Fix appraisal organization to match logged-in user
 */

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

// Load .env
const envContent = readFileSync(".env", "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    process.env[key.trim()] = value.trim();
  }
});

const prisma = new PrismaClient();

async function fix() {
  // Find all users with their orgs
  const users = await prisma.user.findMany({
    include: { organization: true },
    where: { role: "CLIENT" },
  });

  console.log("Available CLIENT users:");
  users.forEach((u) => {
    console.log(`  - ${u.email} (org: ${u.organization?.name || "none"})`);
  });

  // Get client@truplat.app user specifically
  const clientUser = users.find((u) => u.email === "client@truplat.app");
  if (!clientUser) {
    console.log("No client@truplat.app user found");
    return;
  }

  console.log(
    `\nUsing: ${clientUser.email} from ${clientUser.organization?.name}`,
  );

  // Update the test appraisal
  const updated = await prisma.appraisalRequest.updateMany({
    where: { referenceCode: { startsWith: "APR-TEST" } },
    data: {
      organizationId: clientUser.organizationId!,
      requestedById: clientUser.id,
    },
  });

  console.log(`Updated ${updated.count} test appraisals`);

  // Get the appraisal
  const appraisal = await prisma.appraisalRequest.findFirst({
    where: { referenceCode: { startsWith: "APR-TEST" } },
    orderBy: { createdAt: "desc" },
  });

  if (appraisal) {
    console.log(
      `\n✅ View at: http://localhost:3002/appraisals/${appraisal.id}`,
    );
  }

  await prisma.$disconnect();
}

fix();
