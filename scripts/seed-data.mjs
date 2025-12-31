// Comprehensive seed script for Project LENS
// Creates realistic test data for all pages

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data (in reverse order of dependencies)
  console.log("Cleaning existing data...");
  await prisma.evidence.deleteMany();
  await prisma.disputeComment.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.marketplacePurchase.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.shareLink.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.appraisalRequest.deleteMany();
  await prisma.report.deleteMany();
  await prisma.property.deleteMany();
  await prisma.appraiserProfile.deleteMany();
  await prisma.notificationPreferences.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.featureFlag.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 12);

  // ============================================
  // ORGANIZATIONS
  // ============================================
  console.log("\nCreating organizations...");
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Texas Lending Corp",
        slug: "texas-lending-corp",
        address: "100 Congress Ave, Austin, TX 78701",
        billingEmail: "billing@texaslending.com",
        phone: "(512) 555-1000",
        plan: "PROFESSIONAL",
        seats: 10,
      },
    }),
    prisma.organization.create({
      data: {
        name: "Lone Star Mortgage",
        slug: "lone-star-mortgage",
        address: "500 Main St, Dallas, TX 75201",
        billingEmail: "billing@lonestarmortgage.com",
        phone: "(214) 555-2000",
        plan: "STARTER",
        seats: 5,
      },
    }),
    prisma.organization.create({
      data: {
        name: "Houston Capital Group",
        slug: "houston-capital-group",
        address: "1000 Texas Ave, Houston, TX 77002",
        billingEmail: "billing@houstoncapital.com",
        phone: "(713) 555-3000",
        plan: "ENTERPRISE",
        seats: 25,
      },
    }),
  ]);
  console.log(`✅ Created ${orgs.length} organizations`);

  // ============================================
  // USERS
  // ============================================
  console.log("\nCreating users...");

  // Admin users
  const admin = await prisma.user.create({
    data: {
      email: "admin@lens.app",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      email: "super@lens.app",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // Client users (one for each org)
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: "client@lens.app",
        password: hashedPassword,
        firstName: "John",
        lastName: "Smith",
        role: "CLIENT",
        status: "ACTIVE",
        organizationId: orgs[0].id,
        jobTitle: "Loan Officer",
        phone: "(512) 555-1001",
      },
    }),
    prisma.user.create({
      data: {
        email: "maria@lonestarmortgage.com",
        password: hashedPassword,
        firstName: "Maria",
        lastName: "Garcia",
        role: "CLIENT",
        status: "ACTIVE",
        organizationId: orgs[1].id,
        jobTitle: "Senior Loan Processor",
        phone: "(214) 555-2001",
      },
    }),
    prisma.user.create({
      data: {
        email: "robert@houstoncapital.com",
        password: hashedPassword,
        firstName: "Robert",
        lastName: "Johnson",
        role: "CLIENT",
        status: "ACTIVE",
        organizationId: orgs[2].id,
        jobTitle: "VP of Lending",
        phone: "(713) 555-3001",
      },
    }),
  ]);

  // Appraiser users
  const appraisers = await Promise.all([
    prisma.user.create({
      data: {
        email: "appraiser@lens.app",
        password: hashedPassword,
        firstName: "Mike",
        lastName: "Williams",
        role: "APPRAISER",
        status: "ACTIVE",
        location: "Austin, TX",
        phone: "(512) 555-4001",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.appraiser@gmail.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Davis",
        role: "APPRAISER",
        status: "ACTIVE",
        location: "Dallas, TX",
        phone: "(214) 555-4002",
      },
    }),
    prisma.user.create({
      data: {
        email: "james.appraiser@gmail.com",
        password: hashedPassword,
        firstName: "James",
        lastName: "Brown",
        role: "APPRAISER",
        status: "ACTIVE",
        location: "Houston, TX",
        phone: "(713) 555-4003",
      },
    }),
  ]);

  console.log(`✅ Created ${2 + clients.length + appraisers.length} users`);

  // ============================================
  // APPRAISER PROFILES
  // ============================================
  console.log("\nCreating appraiser profiles...");
  const appraiserProfiles = await Promise.all([
    prisma.appraiserProfile.create({
      data: {
        userId: appraisers[0].id,
        licenseType: "CERTIFIED_RESIDENTIAL",
        licenseNumber: "TX-CR-12345",
        licenseExpiry: new Date("2026-12-31"),
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        homeBaseLat: 30.2672,
        homeBaseLng: -97.7431,
        coverageRadiusMiles: 50,
        rating: 4.8,
        ratingCount: 127,
        completedJobs: 342,
        cancelledJobs: 3,
        averageCompletionTime: 45,
        payoutEnabled: true,
        availableJobTypes: ["ONSITE_PHOTOS", "CERTIFIED_APPRAISAL"],
      },
    }),
    prisma.appraiserProfile.create({
      data: {
        userId: appraisers[1].id,
        licenseType: "CERTIFIED_RESIDENTIAL",
        licenseNumber: "TX-CR-23456",
        licenseExpiry: new Date("2025-06-30"),
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        homeBaseLat: 32.7767,
        homeBaseLng: -96.797,
        coverageRadiusMiles: 40,
        rating: 4.6,
        ratingCount: 89,
        completedJobs: 198,
        cancelledJobs: 5,
        averageCompletionTime: 52,
        payoutEnabled: true,
        availableJobTypes: ["ONSITE_PHOTOS"],
      },
    }),
    prisma.appraiserProfile.create({
      data: {
        userId: appraisers[2].id,
        licenseType: "CERTIFIED_GENERAL",
        licenseNumber: "TX-CG-34567",
        licenseExpiry: new Date("2025-09-15"),
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        homeBaseLat: 29.7604,
        homeBaseLng: -95.3698,
        coverageRadiusMiles: 60,
        rating: 4.9,
        ratingCount: 256,
        completedJobs: 512,
        cancelledJobs: 2,
        averageCompletionTime: 38,
        payoutEnabled: true,
        availableJobTypes: ["ONSITE_PHOTOS", "CERTIFIED_APPRAISAL"],
      },
    }),
  ]);
  console.log(`✅ Created ${appraiserProfiles.length} appraiser profiles`);

  // ============================================
  // PROPERTIES
  // ============================================
  console.log("\nCreating properties...");
  const properties = await Promise.all([
    // Austin properties
    prisma.property.create({
      data: {
        addressLine1: "1234 Oak Hill Dr",
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78749",
        addressFull: "1234 Oak Hill Dr, Austin, TX 78749",
        latitude: 30.2291,
        longitude: -97.8467,
        propertyType: "SINGLE_FAMILY",
        yearBuilt: 2015,
        sqft: 2450,
        lotSizeSqft: 8500,
        bedrooms: 4,
        bathrooms: 2.5,
        stories: 2,
      },
    }),
    prisma.property.create({
      data: {
        addressLine1: "567 Congress Ave",
        addressLine2: "Unit 1502",
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78701",
        addressFull: "567 Congress Ave Unit 1502, Austin, TX 78701",
        latitude: 30.2672,
        longitude: -97.7431,
        propertyType: "CONDO",
        yearBuilt: 2020,
        sqft: 1850,
        lotSizeSqft: 0,
        bedrooms: 2,
        bathrooms: 2,
        stories: 1,
      },
    }),
    prisma.property.create({
      data: {
        addressLine1: "890 Barton Springs Rd",
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78704",
        addressFull: "890 Barton Springs Rd, Austin, TX 78704",
        latitude: 30.2598,
        longitude: -97.7566,
        propertyType: "COMMERCIAL",
        yearBuilt: 1985,
        sqft: 12500,
        lotSizeSqft: 25000,
        bedrooms: 0,
        bathrooms: 4,
        stories: 2,
      },
    }),
    // Dallas properties
    prisma.property.create({
      data: {
        addressLine1: "4521 Preston Rd",
        city: "Dallas",
        county: "Dallas",
        state: "TX",
        zipCode: "75205",
        addressFull: "4521 Preston Rd, Dallas, TX 75205",
        latitude: 32.8382,
        longitude: -96.8018,
        propertyType: "SINGLE_FAMILY",
        yearBuilt: 1998,
        sqft: 3200,
        lotSizeSqft: 12000,
        bedrooms: 5,
        bathrooms: 3.5,
        stories: 2,
      },
    }),
    prisma.property.create({
      data: {
        addressLine1: "2100 McKinney Ave",
        addressLine2: "Suite 800",
        city: "Dallas",
        county: "Dallas",
        state: "TX",
        zipCode: "75201",
        addressFull: "2100 McKinney Ave Suite 800, Dallas, TX 75201",
        latitude: 32.7942,
        longitude: -96.8009,
        propertyType: "COMMERCIAL",
        yearBuilt: 2010,
        sqft: 8500,
        lotSizeSqft: 0,
        bedrooms: 0,
        bathrooms: 6,
        stories: 1,
      },
    }),
    // Houston properties
    prisma.property.create({
      data: {
        addressLine1: "3456 Westheimer Rd",
        city: "Houston",
        county: "Harris",
        state: "TX",
        zipCode: "77027",
        addressFull: "3456 Westheimer Rd, Houston, TX 77027",
        latitude: 29.7419,
        longitude: -95.4619,
        propertyType: "MULTI_FAMILY",
        yearBuilt: 2008,
        sqft: 4800,
        lotSizeSqft: 6000,
        bedrooms: 6,
        bathrooms: 4,
        stories: 2,
      },
    }),
    prisma.property.create({
      data: {
        addressLine1: "789 Memorial Dr",
        city: "Houston",
        county: "Harris",
        state: "TX",
        zipCode: "77024",
        addressFull: "789 Memorial Dr, Houston, TX 77024",
        latitude: 29.7726,
        longitude: -95.5091,
        propertyType: "SINGLE_FAMILY",
        yearBuilt: 2022,
        sqft: 5200,
        lotSizeSqft: 15000,
        bedrooms: 5,
        bathrooms: 4.5,
        stories: 2,
      },
    }),
    // San Antonio properties
    prisma.property.create({
      data: {
        addressLine1: "1122 River Walk",
        city: "San Antonio",
        county: "Bexar",
        state: "TX",
        zipCode: "78205",
        addressFull: "1122 River Walk, San Antonio, TX 78205",
        latitude: 29.4241,
        longitude: -98.4936,
        propertyType: "TOWNHOUSE",
        yearBuilt: 2018,
        sqft: 1950,
        lotSizeSqft: 2500,
        bedrooms: 3,
        bathrooms: 2.5,
        stories: 3,
      },
    }),
    // Fort Worth property
    prisma.property.create({
      data: {
        addressLine1: "5678 Camp Bowie Blvd",
        city: "Fort Worth",
        county: "Tarrant",
        state: "TX",
        zipCode: "76107",
        addressFull: "5678 Camp Bowie Blvd, Fort Worth, TX 76107",
        latitude: 32.7385,
        longitude: -97.3927,
        propertyType: "SINGLE_FAMILY",
        yearBuilt: 1965,
        sqft: 2100,
        lotSizeSqft: 9500,
        bedrooms: 3,
        bathrooms: 2,
        stories: 1,
      },
    }),
    // Land property
    prisma.property.create({
      data: {
        addressLine1: "FM 2222",
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78730",
        addressFull: "FM 2222, Austin, TX 78730",
        latitude: 30.3751,
        longitude: -97.8141,
        propertyType: "LAND",
        yearBuilt: null,
        sqft: null,
        lotSizeSqft: 435600, // ~10 acres
        bedrooms: null,
        bathrooms: null,
        stories: null,
      },
    }),
  ]);
  console.log(`✅ Created ${properties.length} properties`);

  // ============================================
  // REPORTS
  // ============================================
  console.log("\nCreating reports...");
  const reports = await Promise.all([
    prisma.report.create({
      data: {
        type: "AI_REPORT",
        valueEstimate: 485000,
        valueRangeMin: 460000,
        valueRangeMax: 510000,
        fastSaleEstimate: 450000,
        confidenceScore: 87.5,
        comps: [
          {
            address: "1230 Oak Hill Dr",
            price: 479000,
            sqft: 2400,
            distance: 0.2,
          },
          {
            address: "1250 Oak Hill Dr",
            price: 492000,
            sqft: 2500,
            distance: 0.3,
          },
          {
            address: "1180 Oak Creek Ln",
            price: 475000,
            sqft: 2380,
            distance: 0.5,
          },
        ],
        compsCount: 3,
        riskFlags: ["near_flood_zone"],
        riskScore: 25,
        aiAnalysis: {
          summary:
            "Property in excellent condition with recent updates. Strong neighborhood demand.",
          strengths: [
            "Updated kitchen",
            "Good school district",
            "Low crime area",
          ],
          weaknesses: ["Near flood zone boundary", "Busy street"],
        },
        marketTrends: {
          trend: "appreciating",
          yearOverYear: 5.2,
          forecast: "stable",
        },
      },
    }),
    prisma.report.create({
      data: {
        type: "AI_REPORT_WITH_ONSITE",
        valueEstimate: 725000,
        valueRangeMin: 690000,
        valueRangeMax: 760000,
        fastSaleEstimate: 680000,
        confidenceScore: 94.2,
        comps: [
          {
            address: "4515 Preston Rd",
            price: 735000,
            sqft: 3180,
            distance: 0.1,
          },
          {
            address: "4530 Preston Rd",
            price: 720000,
            sqft: 3250,
            distance: 0.15,
          },
          {
            address: "4498 Mockingbird Ln",
            price: 715000,
            sqft: 3100,
            distance: 0.4,
          },
          { address: "4610 Turtle Creek", price: 745000, sqft: 3300, distance: 0.5 },
        ],
        compsCount: 4,
        riskFlags: [],
        riskScore: 10,
        aiAnalysis: {
          summary:
            "Premium property in highly desirable Highland Park area. Excellent condition verified on-site.",
          strengths: [
            "Prime location",
            "Recent renovations",
            "Large lot",
            "Top-rated schools",
          ],
          weaknesses: ["Older HVAC system"],
        },
        marketTrends: {
          trend: "appreciating",
          yearOverYear: 8.1,
          forecast: "strong",
        },
      },
    }),
    prisma.report.create({
      data: {
        type: "CERTIFIED_APPRAISAL",
        valueEstimate: 1250000,
        valueRangeMin: 1180000,
        valueRangeMax: 1320000,
        fastSaleEstimate: 1150000,
        confidenceScore: 96.8,
        comps: [
          {
            address: "785 Memorial Dr",
            price: 1280000,
            sqft: 5100,
            distance: 0.2,
          },
          {
            address: "810 Memorial Dr",
            price: 1235000,
            sqft: 5300,
            distance: 0.3,
          },
          {
            address: "760 Piney Point Rd",
            price: 1265000,
            sqft: 5150,
            distance: 0.6,
          },
        ],
        compsCount: 3,
        riskFlags: [],
        riskScore: 5,
        signedAt: new Date(),
        signedById: appraisers[2].id,
        certificationNumber: "TX-CERT-2024-00789",
        aiAnalysis: {
          summary:
            "Luxury new construction in prestigious Memorial area. Fully certified appraisal.",
          strengths: [
            "New construction",
            "Premium finishes",
            "Smart home features",
            "Gated community",
          ],
          weaknesses: [],
        },
        marketTrends: {
          trend: "stable",
          yearOverYear: 3.5,
          forecast: "stable",
        },
      },
    }),
  ]);
  console.log(`✅ Created ${reports.length} reports`);

  // ============================================
  // APPRAISAL REQUESTS
  // ============================================
  console.log("\nCreating appraisal requests...");
  const appraisalRequests = await Promise.all([
    // Completed with report
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[0].id,
        requestedById: clients[0].id,
        propertyId: properties[0].id,
        purpose: "Refinance",
        requestedType: "AI_REPORT",
        status: "READY",
        price: 99,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        reportId: reports[0].id,
      },
    }),
    // Completed with on-site report
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[1].id,
        requestedById: clients[1].id,
        propertyId: properties[3].id,
        purpose: "Purchase",
        requestedType: "AI_REPORT_WITH_ONSITE",
        status: "READY",
        price: 299,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reportId: reports[1].id,
      },
    }),
    // Completed certified appraisal
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[2].id,
        requestedById: clients[2].id,
        propertyId: properties[6].id,
        purpose: "Estate Planning",
        requestedType: "CERTIFIED_APPRAISAL",
        status: "READY",
        price: 599,
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reportId: reports[2].id,
      },
    }),
    // Running
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[0].id,
        requestedById: clients[0].id,
        propertyId: properties[1].id,
        purpose: "Investment Analysis",
        requestedType: "AI_REPORT",
        status: "RUNNING",
        price: 99,
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      },
    }),
    // Queued
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[1].id,
        requestedById: clients[1].id,
        propertyId: properties[4].id,
        purpose: "Commercial Loan",
        requestedType: "AI_REPORT_WITH_ONSITE",
        status: "QUEUED",
        price: 449,
      },
    }),
    // Draft
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[2].id,
        requestedById: clients[2].id,
        propertyId: properties[5].id,
        purpose: "Portfolio Valuation",
        requestedType: "AI_REPORT",
        status: "DRAFT",
        price: 99,
        notes: "Need rush delivery if possible",
      },
    }),
    // Failed
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[0].id,
        requestedById: clients[0].id,
        propertyId: properties[9].id,
        purpose: "Land Development",
        requestedType: "AI_REPORT",
        status: "FAILED",
        statusMessage:
          "Insufficient comparable sales data for vacant land in this area",
        price: 99,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    // Expired
    prisma.appraisalRequest.create({
      data: {
        organizationId: orgs[1].id,
        requestedById: clients[1].id,
        propertyId: properties[7].id,
        purpose: "Refinance",
        requestedType: "AI_REPORT",
        status: "EXPIRED",
        price: 99,
        startedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Expired 4 days ago
      },
    }),
  ]);
  console.log(`✅ Created ${appraisalRequests.length} appraisal requests`);

  // ============================================
  // JOBS
  // ============================================
  console.log("\nCreating jobs...");
  const jobs = await Promise.all([
    // Completed job
    prisma.job.create({
      data: {
        jobType: "ONSITE_PHOTOS",
        propertyId: properties[3].id,
        organizationId: orgs[1].id,
        appraisalRequestId: appraisalRequests[1].id,
        assignedAppraiserId: appraisers[1].id,
        scope:
          "Capture exterior photos (front, back, sides), interior photos of all rooms, kitchen appliances, HVAC system, and any visible damage or repairs needed.",
        accessContact: {
          name: "Property Manager",
          phone: "(214) 555-8888",
          email: "pm@propertymanage.com",
        },
        schedulingWindow: {
          preferredDays: ["Monday", "Tuesday", "Wednesday"],
          preferredTimes: ["9AM-12PM", "1PM-5PM"],
        },
        payoutAmount: 150,
        status: "COMPLETED",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "DISPATCHED", at: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "ACCEPTED", at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "IN_PROGRESS", at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "SUBMITTED", at: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "COMPLETED", at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        slaDueAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        geofenceVerified: true,
      },
    }),
    // In progress job
    prisma.job.create({
      data: {
        jobType: "ONSITE_PHOTOS",
        propertyId: properties[4].id,
        organizationId: orgs[1].id,
        appraisalRequestId: appraisalRequests[4].id,
        assignedAppraiserId: appraisers[1].id,
        scope:
          "Commercial property inspection. Capture all office spaces, common areas, parking structure, and building systems.",
        accessContact: {
          name: "Building Security",
          phone: "(214) 555-9999",
          email: "security@building.com",
        },
        schedulingWindow: {
          preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          preferredTimes: ["8AM-6PM"],
        },
        payoutAmount: 250,
        status: "IN_PROGRESS",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "DISPATCHED", at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "ACCEPTED", at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "IN_PROGRESS", at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
        ],
        slaDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    }),
    // Accepted job waiting to start
    prisma.job.create({
      data: {
        jobType: "CERTIFIED_APPRAISAL",
        propertyId: properties[8].id,
        organizationId: orgs[0].id,
        assignedAppraiserId: appraisers[0].id,
        scope:
          "Full certified appraisal required. Include detailed property inspection, neighborhood analysis, and comparable sales review.",
        accessContact: {
          name: "Homeowner John Doe",
          phone: "(817) 555-1234",
        },
        schedulingWindow: {
          preferredDays: ["Saturday"],
          preferredTimes: ["10AM-2PM"],
        },
        payoutAmount: 400,
        status: "ACCEPTED",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "DISPATCHED", at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "ACCEPTED", at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        slaDueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    // Dispatched job waiting for acceptance
    prisma.job.create({
      data: {
        jobType: "ONSITE_PHOTOS",
        propertyId: properties[5].id,
        organizationId: orgs[2].id,
        assignedAppraiserId: appraisers[2].id,
        scope: "Multi-family property inspection. Document each unit, common areas, and exterior.",
        accessContact: {
          name: "Property Owner",
          phone: "(713) 555-5555",
        },
        schedulingWindow: {
          preferredDays: ["Monday", "Wednesday", "Friday"],
          preferredTimes: ["9AM-5PM"],
        },
        payoutAmount: 200,
        status: "DISPATCHED",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
          { status: "DISPATCHED", at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
        ],
        slaDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    }),
    // Pending dispatch job
    prisma.job.create({
      data: {
        jobType: "ONSITE_PHOTOS",
        propertyId: properties[2].id,
        organizationId: orgs[0].id,
        scope: "Commercial property - retail space inspection required.",
        accessContact: {
          name: "Store Manager",
          phone: "(512) 555-7777",
        },
        schedulingWindow: {
          preferredDays: ["Tuesday", "Thursday"],
          preferredTimes: ["6AM-8AM", "8PM-10PM"],
          notes: "Outside business hours only",
        },
        payoutAmount: 175,
        status: "PENDING_DISPATCH",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date().toISOString() },
        ],
        slaDueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
    }),
    // Submitted job under review
    prisma.job.create({
      data: {
        jobType: "CERTIFIED_APPRAISAL",
        propertyId: properties[6].id,
        organizationId: orgs[2].id,
        appraisalRequestId: appraisalRequests[2].id,
        assignedAppraiserId: appraisers[2].id,
        scope: "Full certified appraisal for luxury property. Detailed analysis required.",
        accessContact: {
          name: "Estate Manager",
          phone: "(713) 555-0001",
          email: "estate@luxury.com",
        },
        schedulingWindow: {
          preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          preferredTimes: ["10AM-4PM"],
        },
        payoutAmount: 500,
        status: "UNDER_REVIEW",
        statusHistory: [
          { status: "PENDING_DISPATCH", at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "DISPATCHED", at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "ACCEPTED", at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "IN_PROGRESS", at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "SUBMITTED", at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "UNDER_REVIEW", at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        slaDueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dispatchedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        geofenceVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${jobs.length} jobs`);

  // ============================================
  // EVIDENCE
  // ============================================
  console.log("\nCreating evidence...");
  const evidence = await Promise.all([
    prisma.evidence.create({
      data: {
        jobId: jobs[0].id,
        mediaType: "PHOTO",
        fileName: "front_exterior.jpg",
        fileSize: 2456789,
        mimeType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        thumbnailUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200",
        latitude: 32.8382,
        longitude: -96.8018,
        capturedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        integrityHash: "sha256-abc123def456",
        verified: true,
        category: "front",
        notes: "Front exterior view from street",
      },
    }),
    prisma.evidence.create({
      data: {
        jobId: jobs[0].id,
        mediaType: "PHOTO",
        fileName: "kitchen.jpg",
        fileSize: 1987654,
        mimeType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
        latitude: 32.8382,
        longitude: -96.8018,
        capturedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        integrityHash: "sha256-def456ghi789",
        verified: true,
        category: "kitchen",
        notes: "Kitchen with updated appliances",
      },
    }),
    prisma.evidence.create({
      data: {
        jobId: jobs[0].id,
        mediaType: "PHOTO",
        fileName: "living_room.jpg",
        fileSize: 2123456,
        mimeType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
        latitude: 32.8382,
        longitude: -96.8018,
        capturedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        integrityHash: "sha256-ghi789jkl012",
        verified: true,
        category: "living_room",
      },
    }),
    prisma.evidence.create({
      data: {
        jobId: jobs[0].id,
        mediaType: "PHOTO",
        fileName: "backyard.jpg",
        fileSize: 2567890,
        mimeType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
        latitude: 32.8382,
        longitude: -96.8018,
        capturedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        integrityHash: "sha256-jkl012mno345",
        verified: true,
        category: "back",
      },
    }),
    prisma.evidence.create({
      data: {
        jobId: jobs[1].id,
        mediaType: "PHOTO",
        fileName: "office_entrance.jpg",
        fileSize: 1876543,
        mimeType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200",
        latitude: 32.7942,
        longitude: -96.8009,
        capturedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        integrityHash: "sha256-mno345pqr678",
        verified: true,
        category: "entrance",
        notes: "Main building entrance",
      },
    }),
  ]);
  console.log(`✅ Created ${evidence.length} evidence items`);

  // ============================================
  // PAYMENTS
  // ============================================
  console.log("\nCreating payments...");
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        organizationId: orgs[0].id,
        type: "CHARGE",
        amount: 99,
        description: "AI Report - 1234 Oak Hill Dr",
        relatedAppraisalId: appraisalRequests[0].id,
        status: "COMPLETED",
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        organizationId: orgs[1].id,
        type: "CHARGE",
        amount: 299,
        description: "AI Report with On-site - 4521 Preston Rd",
        relatedAppraisalId: appraisalRequests[1].id,
        status: "COMPLETED",
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        userId: appraisers[1].id,
        type: "PAYOUT",
        amount: 150,
        description: "Payout for job at 4521 Preston Rd",
        relatedJobId: jobs[0].id,
        status: "COMPLETED",
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        organizationId: orgs[2].id,
        type: "CHARGE",
        amount: 599,
        description: "Certified Appraisal - 789 Memorial Dr",
        relatedAppraisalId: appraisalRequests[2].id,
        status: "COMPLETED",
        processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        userId: appraisers[2].id,
        type: "PAYOUT",
        amount: 500,
        description: "Payout for certified appraisal at 789 Memorial Dr",
        relatedJobId: jobs[5].id,
        status: "PENDING",
      },
    }),
  ]);
  console.log(`✅ Created ${payments.length} payments`);

  // ============================================
  // DISPUTES
  // ============================================
  console.log("\nCreating disputes...");
  const disputes = await Promise.all([
    prisma.dispute.create({
      data: {
        organizationId: orgs[0].id,
        relatedReportId: reports[0].id,
        category: "VALUATION_ACCURACY",
        subject: "Value estimate seems low compared to recent sale nearby",
        description:
          "A similar property at 1228 Oak Hill Dr just sold for $520,000 last week. Our estimate of $485,000 seems conservative given this recent comparable.",
        status: "OPEN",
        priority: 2,
      },
    }),
    prisma.dispute.create({
      data: {
        organizationId: orgs[1].id,
        relatedJobId: jobs[0].id,
        category: "PHOTO_QUALITY",
        subject: "Missing photos of garage interior",
        description:
          "The job scope required photos of the garage interior, but none were included in the submission. Need these for complete documentation.",
        status: "RESOLVED",
        priority: 3,
        resolution:
          "Appraiser submitted additional garage photos. Documentation now complete.",
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`✅ Created ${disputes.length} disputes`);

  // ============================================
  // PRICING RULES
  // ============================================
  console.log("\nCreating pricing rules...");
  const pricingRules = await Promise.all([
    // Base prices by report type
    prisma.pricingRule.create({
      data: {
        ruleType: "base_price",
        propertyType: "SINGLE_FAMILY",
        jobType: null,
        basePrice: 99,
        platformFeePercent: 20,
        appraiserPayoutPercent: 80,
      },
    }),
    prisma.pricingRule.create({
      data: {
        ruleType: "base_price",
        propertyType: "MULTI_FAMILY",
        basePrice: 149,
        platformFeePercent: 20,
        appraiserPayoutPercent: 80,
      },
    }),
    prisma.pricingRule.create({
      data: {
        ruleType: "base_price",
        propertyType: "COMMERCIAL",
        basePrice: 299,
        platformFeePercent: 25,
        appraiserPayoutPercent: 75,
      },
    }),
    // County multipliers
    prisma.pricingRule.create({
      data: {
        ruleType: "county_multiplier",
        county: "Travis",
        multiplier: 1.15,
      },
    }),
    prisma.pricingRule.create({
      data: {
        ruleType: "county_multiplier",
        county: "Dallas",
        multiplier: 1.1,
      },
    }),
    prisma.pricingRule.create({
      data: {
        ruleType: "county_multiplier",
        county: "Harris",
        multiplier: 1.2,
      },
    }),
    // Job type pricing
    prisma.pricingRule.create({
      data: {
        ruleType: "job_payout",
        jobType: "ONSITE_PHOTOS",
        basePrice: 150,
        minPrice: 100,
        maxPrice: 300,
      },
    }),
    prisma.pricingRule.create({
      data: {
        ruleType: "job_payout",
        jobType: "CERTIFIED_APPRAISAL",
        basePrice: 400,
        minPrice: 300,
        maxPrice: 600,
      },
    }),
  ]);
  console.log(`✅ Created ${pricingRules.length} pricing rules`);

  // ============================================
  // FEATURE FLAGS
  // ============================================
  console.log("\nCreating feature flags...");
  const featureFlags = await Promise.all([
    prisma.featureFlag.create({
      data: {
        name: "marketplace_enabled",
        description: "Enable the DD Marketplace for buying/selling reports",
        isEnabled: true,
      },
    }),
    prisma.featureFlag.create({
      data: {
        name: "ai_chat_assistant",
        description: "Enable AI chat assistant for property analysis",
        isEnabled: false,
      },
    }),
    prisma.featureFlag.create({
      data: {
        name: "rush_delivery",
        description: "Allow rush delivery option for reports",
        isEnabled: true,
      },
    }),
  ]);
  console.log(`✅ Created ${featureFlags.length} feature flags`);

  // ============================================
  // MARKETPLACE LISTINGS
  // ============================================
  console.log("\nCreating marketplace listings...");
  const listings = await Promise.all([
    prisma.marketplaceListing.create({
      data: {
        reportId: reports[0].id,
        sellerId: orgs[0].id,
        title: "Austin Single Family - Oak Hill Area",
        description:
          "Recent AI-generated report for a well-maintained single family home in the desirable Oak Hill neighborhood. 4 bed/2.5 bath, 2,450 sqft.",
        category: "residential",
        price: 29,
        status: "ACTIVE",
        soldCount: 2,
        viewCount: 45,
      },
    }),
    prisma.marketplaceListing.create({
      data: {
        reportId: reports[1].id,
        sellerId: orgs[1].id,
        title: "Dallas Highland Park Luxury Home",
        description:
          "Comprehensive AI report with on-site verification for premium Highland Park property. 5 bed/3.5 bath, 3,200 sqft. Excellent condition.",
        category: "residential",
        price: 49,
        status: "ACTIVE",
        isFeatured: true,
        featuredAt: new Date(),
        soldCount: 5,
        viewCount: 128,
      },
    }),
  ]);
  console.log(`✅ Created ${listings.length} marketplace listings`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("✅ Database seeded successfully!");
  console.log("=".repeat(50));
  console.log("\n📋 Test Accounts (all use password: password123):\n");
  console.log("  ADMIN:");
  console.log("    - admin@lens.app (Admin)");
  console.log("    - super@lens.app (Super Admin)\n");
  console.log("  CLIENTS:");
  console.log("    - client@lens.app (Texas Lending Corp)");
  console.log("    - maria@lonestarmortgage.com (Lone Star Mortgage)");
  console.log("    - robert@houstoncapital.com (Houston Capital Group)\n");
  console.log("  APPRAISERS:");
  console.log("    - appraiser@lens.app (Austin area)");
  console.log("    - sarah.appraiser@gmail.com (Dallas area)");
  console.log("    - james.appraiser@gmail.com (Houston area)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
