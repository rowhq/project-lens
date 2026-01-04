import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Check all recent appraisals
  const all = await prisma.appraisalRequest.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      referenceCode: true,
      status: true,
      statusMessage: true,
      updatedAt: true,
    },
  });
  console.log("Recent appraisals:");
  for (const ap of all) {
    console.log(
      `  ${ap.referenceCode}: ${ap.status} - ${ap.statusMessage || "(no message)"}`,
    );
  }
  await prisma.$disconnect();
}
main();
