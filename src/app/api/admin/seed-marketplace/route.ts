import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

const marketplaceListings = [
  // Phase I ESA Documents
  {
    id: "listing-esa-001",
    title: "Phase I Environmental Site Assessment - Commercial Property",
    description:
      "Comprehensive Phase I ESA conducted in June 2024 for 2.5-acre commercial site. Includes site reconnaissance, historical research, regulatory database review, and interviews. No RECs identified.",
    category: "commercial",
    studyCategory: "ENVIRONMENTAL" as const,
    price: 500,
    city: "Spring",
    county: "Montgomery",
    state: "TX",
    zipCode: "77386",
    latitude: 30.0799,
    longitude: -95.4172,
    viewCount: 42,
    soldCount: 3,
  },
  {
    id: "listing-esa-002",
    title: "Phase I ESA - Industrial Warehouse Complex",
    description:
      "Phase I Environmental Assessment for 15-acre industrial site in Pasadena. Historical use review, vapor intrusion screening, and regulatory compliance check included. Clean findings.",
    category: "industrial",
    studyCategory: "ENVIRONMENTAL" as const,
    price: 750,
    city: "Pasadena",
    county: "Harris",
    state: "TX",
    zipCode: "77506",
    latitude: 29.6911,
    longitude: -95.2091,
    viewCount: 28,
    soldCount: 1,
  },
  {
    id: "listing-esa-003",
    title: "Phase I ESA - Retail Shopping Center",
    description:
      "Environmental assessment for 8-acre retail development site. Former agricultural use. Includes wetland delineation and threatened species habitat review.",
    category: "commercial",
    studyCategory: "ENVIRONMENTAL" as const,
    price: 600,
    city: "Sugar Land",
    county: "Fort Bend",
    state: "TX",
    zipCode: "77479",
    latitude: 29.6197,
    longitude: -95.6349,
    viewCount: 35,
    soldCount: 2,
  },

  // Surveys
  {
    id: "listing-survey-001",
    title: "ALTA Survey - 5-Acre Development Site",
    description:
      "ALTA/NSPS Land Title Survey completed March 2024 for 5-acre mixed-use development site. Includes topographic information, easements, utilities, flood zone determination.",
    category: "land",
    studyCategory: "SURVEY" as const,
    price: 750,
    city: "Tomball",
    county: "Harris",
    state: "TX",
    zipCode: "77375",
    latitude: 30.0972,
    longitude: -95.6161,
    viewCount: 68,
    soldCount: 5,
  },
  {
    id: "listing-survey-002",
    title: "Boundary Survey - 12-Acre Ranch Property",
    description:
      "Complete boundary survey with corner monumentation for 12-acre rural property. Includes legal description, adjacent property information, and fence line analysis.",
    category: "land",
    studyCategory: "SURVEY" as const,
    price: 450,
    city: "Magnolia",
    county: "Montgomery",
    state: "TX",
    zipCode: "77354",
    latitude: 30.2091,
    longitude: -95.7508,
    viewCount: 24,
    soldCount: 1,
  },
  {
    id: "listing-survey-003",
    title: "Topographic Survey - Commercial Lot",
    description:
      "Detailed topographic survey for 3-acre commercial site. 1-foot contours, spot elevations, existing utilities, and drainage patterns mapped.",
    category: "commercial",
    studyCategory: "SURVEY" as const,
    price: 550,
    city: "Katy",
    county: "Harris",
    state: "TX",
    zipCode: "77494",
    latitude: 29.7858,
    longitude: -95.8245,
    viewCount: 31,
    soldCount: 2,
  },

  // Civil Engineering Plans
  {
    id: "listing-civil-001",
    title: "Civil Engineering Plans - Multi-Family Development",
    description:
      "Complete civil engineering plan set for 150-unit multi-family development. Includes site plan, grading, drainage, utility design, paving, erosion control, and construction details.",
    category: "residential",
    studyCategory: "CIVIL_ENGINEERING" as const,
    price: 1200,
    city: "The Woodlands",
    county: "Montgomery",
    state: "TX",
    zipCode: "77380",
    latitude: 30.1658,
    longitude: -95.4613,
    viewCount: 91,
    soldCount: 7,
  },
  {
    id: "listing-civil-002",
    title: "Site Development Plans - Retail Pad Site",
    description:
      "Civil plans for 2-acre retail pad site development. Includes site grading, parking lot design, stormwater management, and utility connections.",
    category: "commercial",
    studyCategory: "CIVIL_ENGINEERING" as const,
    price: 800,
    city: "Pearland",
    county: "Brazoria",
    state: "TX",
    zipCode: "77584",
    latitude: 29.5636,
    longitude: -95.286,
    viewCount: 45,
    soldCount: 3,
  },

  // Geotechnical Reports
  {
    id: "listing-geotech-001",
    title: "Geotechnical Investigation - High-Rise Foundation",
    description:
      "Comprehensive geotechnical study for 20-story mixed-use building. Includes 8 borings to 150ft, laboratory testing, foundation recommendations, and seismic analysis.",
    category: "commercial",
    studyCategory: "GEOTECHNICAL" as const,
    price: 2500,
    city: "Houston",
    county: "Harris",
    state: "TX",
    zipCode: "77002",
    latitude: 29.7604,
    longitude: -95.3698,
    viewCount: 156,
    soldCount: 4,
  },
  {
    id: "listing-geotech-002",
    title: "Geotechnical Report - Single Family Subdivision",
    description:
      "Geotechnical engineering report for 50-lot residential subdivision. Soil borings, plasticity index testing, and foundation design parameters for slab-on-grade construction.",
    category: "residential",
    studyCategory: "GEOTECHNICAL" as const,
    price: 950,
    city: "Cypress",
    county: "Harris",
    state: "TX",
    zipCode: "77433",
    latitude: 29.9691,
    longitude: -95.6972,
    viewCount: 38,
    soldCount: 2,
  },

  // Title Reports
  {
    id: "listing-title-001",
    title: "Title Commitment & Survey - Office Building",
    description:
      "Full title commitment with Schedule B exceptions, plus ALTA survey for 50,000 SF office building. Includes easement research and encumbrance analysis.",
    category: "commercial",
    studyCategory: "TITLE_REPORT" as const,
    price: 400,
    city: "Dallas",
    county: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7767,
    longitude: -96.797,
    viewCount: 52,
    soldCount: 6,
  },
  {
    id: "listing-title-002",
    title: "Title Search - Vacant Land Parcel",
    description:
      "60-year title search for 25-acre vacant land parcel. Chain of title, lien search, judgment search, and tax status verification included.",
    category: "land",
    studyCategory: "TITLE_REPORT" as const,
    price: 300,
    city: "Austin",
    county: "Travis",
    state: "TX",
    zipCode: "78748",
    latitude: 30.1821,
    longitude: -97.8102,
    viewCount: 29,
    soldCount: 2,
  },

  // Zoning Analysis
  {
    id: "listing-zoning-001",
    title: "Zoning Analysis & Entitlement Report",
    description:
      "Comprehensive zoning analysis for proposed mixed-use development. Includes permitted uses, setbacks, height limits, parking requirements, and variance recommendations.",
    category: "commercial",
    studyCategory: "ZONING_ANALYSIS" as const,
    price: 650,
    city: "San Antonio",
    county: "Bexar",
    state: "TX",
    zipCode: "78205",
    latitude: 29.4241,
    longitude: -98.4936,
    viewCount: 41,
    soldCount: 3,
  },

  // Soil Studies
  {
    id: "listing-soil-001",
    title: "Soil Percolation Test - Septic System Design",
    description:
      "Percolation testing and soil analysis for residential septic system. Includes soil boring logs, absorption rate calculations, and system sizing recommendations.",
    category: "residential",
    studyCategory: "SOIL_STUDY" as const,
    price: 350,
    city: "Dripping Springs",
    county: "Hays",
    state: "TX",
    zipCode: "78620",
    latitude: 30.1902,
    longitude: -98.0867,
    viewCount: 18,
    soldCount: 1,
  },

  // Drainage Studies
  {
    id: "listing-drainage-001",
    title: "Drainage Impact Analysis - Subdivision Development",
    description:
      "Detailed drainage study for 100-acre residential subdivision. Includes pre/post hydrology, detention pond design, outfall analysis, and FEMA coordination.",
    category: "residential",
    studyCategory: "DRAINAGE_STUDY" as const,
    price: 1100,
    city: "League City",
    county: "Galveston",
    state: "TX",
    zipCode: "77573",
    latitude: 29.5075,
    longitude: -95.0949,
    viewCount: 63,
    soldCount: 4,
  },

  // Structural Reports
  {
    id: "listing-structural-001",
    title: "Structural Assessment - Historic Building Renovation",
    description:
      "Structural condition assessment for 1920s commercial building. Includes foundation evaluation, load capacity analysis, and renovation recommendations.",
    category: "commercial",
    studyCategory: "STRUCTURAL" as const,
    price: 850,
    city: "Fort Worth",
    county: "Tarrant",
    state: "TX",
    zipCode: "76102",
    latitude: 32.7555,
    longitude: -97.3308,
    viewCount: 37,
    soldCount: 2,
  },

  // Flood Risk
  {
    id: "listing-flood-001",
    title: "Flood Risk Assessment & LOMA Application",
    description:
      "Comprehensive flood risk analysis with FEMA Letter of Map Amendment application. Includes elevation certificate, hydraulic analysis, and flood insurance recommendations.",
    category: "residential",
    studyCategory: "FLOOD_RISK" as const,
    price: 550,
    city: "Humble",
    county: "Harris",
    state: "TX",
    zipCode: "77338",
    latitude: 29.9988,
    longitude: -95.2622,
    viewCount: 44,
    soldCount: 3,
  },

  // Additional Appraisal Reports
  {
    id: "listing-appraisal-001",
    title: "Commercial Appraisal - Strip Mall",
    description:
      "Full commercial appraisal for 25,000 SF strip mall with 8 tenants. Income approach, sales comparison, and cost approach included. MAI certified.",
    category: "commercial",
    studyCategory: "APPRAISAL_REPORT" as const,
    price: 1800,
    city: "Plano",
    county: "Collin",
    state: "TX",
    zipCode: "75024",
    latitude: 33.0198,
    longitude: -96.6989,
    viewCount: 72,
    soldCount: 5,
  },
  {
    id: "listing-appraisal-002",
    title: "Residential Appraisal - Luxury Estate",
    description:
      "Comprehensive appraisal for 8,500 SF luxury estate on 5 acres. Includes detailed comparable analysis, site improvements, and amenity adjustments.",
    category: "residential",
    studyCategory: "APPRAISAL_REPORT" as const,
    price: 950,
    city: "Southlake",
    county: "Tarrant",
    state: "TX",
    zipCode: "76092",
    latitude: 32.9412,
    longitude: -97.1342,
    viewCount: 89,
    soldCount: 4,
  },
  {
    id: "listing-appraisal-003",
    title: "Land Appraisal - Development Tract",
    description:
      "Land appraisal for 45-acre development tract with preliminary plat approval. Includes highest and best use analysis and development cost estimates.",
    category: "land",
    studyCategory: "APPRAISAL_REPORT" as const,
    price: 1200,
    city: "Georgetown",
    county: "Williamson",
    state: "TX",
    zipCode: "78628",
    latitude: 30.6323,
    longitude: -97.6781,
    viewCount: 56,
    soldCount: 3,
  },
  {
    id: "listing-appraisal-004",
    title: "Industrial Appraisal - Manufacturing Facility",
    description:
      "Industrial property appraisal for 150,000 SF manufacturing facility with rail access. Includes equipment valuation and going concern analysis.",
    category: "industrial",
    studyCategory: "APPRAISAL_REPORT" as const,
    price: 2200,
    city: "Irving",
    county: "Dallas",
    state: "TX",
    zipCode: "75062",
    latitude: 32.814,
    longitude: -96.9489,
    viewCount: 48,
    soldCount: 2,
  },
];

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Find a seller organization (any org will work)
    const sellerOrg = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!sellerOrg) {
      return NextResponse.json(
        { error: "No organization found. Create an organization first." },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;

    for (const listing of marketplaceListings) {
      const existing = await prisma.marketplaceListing.findUnique({
        where: { id: listing.id },
      });

      await prisma.marketplaceListing.upsert({
        where: { id: listing.id },
        update: {},
        create: {
          ...listing,
          sellerId: sellerOrg.id,
          status: "ACTIVE",
        },
      });

      if (existing) {
        updated++;
      } else {
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      total: marketplaceListings.length,
      sellerId: sellerOrg.id,
      sellerName: sellerOrg.name,
    });
  } catch (error) {
    console.error("Seed marketplace error:", error);
    return NextResponse.json(
      { error: "Failed to seed marketplace" },
      { status: 500 },
    );
  }
}
