/**
 * Test Appraisal Flow (bypasses Stripe)
 * Run with: npx tsx scripts/test-appraisal-flow.ts
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

async function testAppraisalFlow() {
  console.log("🧪 Testing Appraisal Flow (bypassing Stripe)\n");

  try {
    // 1. Find an organization and user
    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();

    if (!org || !user) {
      console.error(
        "❌ No organization or user found. Please create one first.",
      );
      process.exit(1);
    }

    console.log(`📋 Using org: ${org.name}`);
    console.log(`👤 Using user: ${user.email}\n`);

    // 2. Find existing property or create one
    let property = await prisma.property.findFirst();

    if (!property) {
      property = await prisma.property.create({
        data: {
          addressLine1: "9876 Test Lane",
          addressFull: "9876 Test Lane, Austin, TX 78749",
          city: "Austin",
          state: "TX",
          zipCode: "78749",
          county: "Travis",
          propertyType: "SINGLE_FAMILY",
          latitude: 30.2172,
          longitude: -97.8661,
          sqft: 2200,
          bedrooms: 4,
          bathrooms: 2.5,
          yearBuilt: 2015,
          lotSizeSqft: 8000,
        },
      });
      console.log(`🏠 Created property: ${property.addressFull}`);
    } else {
      console.log(`🏠 Using existing property: ${property.addressFull}`);
    }

    // 3. Create an appraisal request in QUEUED status (simulating paid)
    const refCode = `APR-TEST-${Date.now().toString(36).toUpperCase()}`;
    const appraisal = await prisma.appraisalRequest.create({
      data: {
        referenceCode: refCode,
        propertyId: property.id,
        organizationId: org.id,
        requestedById: user.id,
        requestedType: "AI_REPORT",
        purpose: "Test Purchase",
        status: "QUEUED",
        statusMessage: "Test - Processing started",
        price: 29.0,
      },
    });
    console.log(
      `📝 Created appraisal: ${appraisal.referenceCode} (status: QUEUED)`,
    );

    // 4. Now trigger the processing
    console.log("\n🚀 Starting appraisal processing...\n");

    // Dynamic import to get the processor
    const { processAppraisal } =
      await import("../src/server/services/appraisal-processor/index.js");

    const result = await processAppraisal(appraisal.id);

    console.log("\n📊 Processing Result:");
    console.log(JSON.stringify(result, null, 2));

    // 5. Check the final state
    const finalAppraisal = await prisma.appraisalRequest.findUnique({
      where: { id: appraisal.id },
      include: { report: true },
    });

    console.log("\n✅ Final Appraisal State:");
    console.log(`   Status: ${finalAppraisal?.status}`);
    console.log(`   Report ID: ${finalAppraisal?.report?.id || "N/A"}`);
    console.log(`   PDF URL: ${finalAppraisal?.report?.pdfUrl || "N/A"}`);
    console.log(
      `   Value Estimate: $${finalAppraisal?.report?.valueEstimate?.toLocaleString() || "N/A"}`,
    );

    if (finalAppraisal?.report?.pdfUrl) {
      console.log("\n🎉 SUCCESS! PDF was generated and uploaded to R2!");
      console.log(
        `\n📄 View at: http://localhost:3002/appraisals/${appraisal.id}`,
      );
    } else {
      console.log("\n⚠️ No PDF URL - check logs above for errors");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAppraisalFlow();
