"use client";

import { useState } from "react";
import { PRICING, SUBSCRIPTION_PLANS } from "@/shared/config/constants";
import {
  Zap,
  Camera,
  Award,
  Users,
  Shield,
  Map,
  CheckCircle,
  Database,
  Code,
  Globe,
  Layers,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Briefcase,
  Settings,
  Lock,
  Server,
} from "lucide-react";

// Navigation sections
const sections = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "pricing", label: "Pricing & Plans", icon: DollarSign },
  { id: "features", label: "Core Features", icon: Zap },
  { id: "workflow", label: "Workflows", icon: TrendingUp },
  { id: "users", label: "User Roles", icon: Users },
  { id: "architecture", label: "Architecture", icon: Server },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "database", label: "Database Schema", icon: Database },
  { id: "api", label: "API Reference", icon: Code },
  { id: "security", label: "Security", icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-16 bottom-0 w-64 border-r border-gray-800 bg-gray-950 overflow-y-auto">
        <div className="p-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-4">
            Contents
          </h2>
          <ul className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      document
                        .getElementById(section.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      activeSection === section.id
                        ? "text-lime-400 bg-lime-400/10"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 flex-1 max-w-4xl mx-auto px-8 py-12">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            TruPlat Documentation
          </h1>
          <p className="text-xl text-gray-400">
            Complete technical and product documentation for the AI-Powered
            Property Valuation Platform.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <span className="px-3 py-1 bg-lime-400/10 text-lime-400 font-mono text-xs uppercase tracking-wider clip-notch-sm border border-lime-400/30">
              Version 0.1.0
            </span>
            <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 font-mono text-xs uppercase tracking-wider clip-notch-sm border border-cyan-400/30">
              Texas Market
            </span>
          </div>
        </div>

        {/* Overview Section */}
        <section id="overview" className="mb-20">
          <SectionHeader icon={Layers} title="Overview" />

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 text-lg leading-relaxed">
              <strong className="text-white">TruPlat</strong> is a comprehensive
              AI-powered property appraisal platform that combines cutting-edge
              machine learning with licensed professional appraisers to deliver
              fast, accurate, and legally compliant property valuations.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <InfoCard
              icon={Zap}
              title="AI-Powered Valuations"
              description="Instant property valuations using RapidCanvas AI and GPT-4o analysis with 72%+ baseline confidence."
            />
            <InfoCard
              icon={Camera}
              title="On-Site Verification"
              description="Professional appraisers conduct physical inspections with geotagged photo evidence."
            />
            <InfoCard
              icon={Award}
              title="USPAP Certified"
              description="Full USPAP-compliant appraisals signed by licensed appraisers, accepted by lenders."
            />
            <InfoCard
              icon={Map}
              title="Texas Coverage"
              description="Operating in 15+ Texas counties including Austin, Houston, Dallas, San Antonio."
            />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-6">
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="AI Report SLA" value="30 min" />
              <MetricCard label="On-Site SLA" value="48 hrs" />
              <MetricCard label="Certified SLA" value="72 hrs" />
              <MetricCard label="Counties" value="15+" />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-20">
          <SectionHeader icon={DollarSign} title="Pricing & Plans" />

          <h3 className="text-xl font-semibold text-white mb-6">
            Per-Report Pricing
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <PricingCard
              tier="free"
              name="Starter"
              price="Free"
              subtitle="5 reports/month"
              features={[
                "5 AI Reports/month",
                "Comparable analysis",
                "Risk assessment",
                "PDF download",
              ]}
            />
            <PricingCard
              tier="basic"
              name="AI Report"
              price={`$${PRICING.AI_REPORT}`}
              subtitle="per report"
              features={[
                "Unlimited AI Reports",
                "30-minute delivery",
                "Comparable analysis",
                "Risk flags",
                "PDF download",
                "Share links",
              ]}
            />
            <PricingCard
              tier="popular"
              name="Verified"
              price={`$${PRICING.ON_SITE}`}
              subtitle="per report"
              popular
              features={[
                "Everything in AI Report",
                "48-hour delivery",
                "Physical inspection",
                "Geotagged photos",
                "Condition assessment",
                "Field notes",
              ]}
            />
            <PricingCard
              tier="premium"
              name="Certified"
              price={`$${PRICING.CERTIFIED}`}
              subtitle="per report"
              features={[
                "Everything in Verified",
                "72-hour delivery",
                "Licensed appraiser",
                "USPAP compliant",
                "Court admissible",
                "Digital signature",
              ]}
            />
          </div>

          <h3 className="text-xl font-semibold text-white mb-6">
            Subscription Plans
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="py-3 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="py-3 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                    Reports/Mo
                  </th>
                  <th className="py-3 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                    Features
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-800/50">
                  <td className="py-4 px-4 text-white font-medium">
                    {SUBSCRIPTION_PLANS.STARTER.name}
                  </td>
                  <td className="py-4 px-4 text-emerald-400 font-mono">Free</td>
                  <td className="py-4 px-4 text-gray-400">
                    {SUBSCRIPTION_PLANS.STARTER.reportsPerMonth}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {SUBSCRIPTION_PLANS.STARTER.features.join(", ")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-4 px-4 text-white font-medium">
                    {SUBSCRIPTION_PLANS.PROFESSIONAL.name}
                  </td>
                  <td className="py-4 px-4 text-lime-400 font-mono">
                    ${SUBSCRIPTION_PLANS.PROFESSIONAL.price}/mo
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {SUBSCRIPTION_PLANS.PROFESSIONAL.reportsPerMonth}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {SUBSCRIPTION_PLANS.PROFESSIONAL.features
                      .slice(0, 4)
                      .join(", ")}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white font-medium">
                    {SUBSCRIPTION_PLANS.ENTERPRISE.name}
                  </td>
                  <td className="py-4 px-4 text-amber-400 font-mono">
                    ${SUBSCRIPTION_PLANS.ENTERPRISE.price}/mo
                  </td>
                  <td className="py-4 px-4 text-gray-400">Unlimited</td>
                  <td className="py-4 px-4 text-gray-400">
                    {SUBSCRIPTION_PLANS.ENTERPRISE.features
                      .slice(0, 4)
                      .join(", ")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-6">
              Appraiser Payouts
            </h3>
            <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    On-Site Jobs
                  </h4>
                  <p className="text-white">
                    Base <span className="text-lime-400 font-mono">$75</span> +
                    50% of revenue
                  </p>
                </div>
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Certified Jobs
                  </h4>
                  <p className="text-white">
                    Base <span className="text-lime-400 font-mono">$225</span> +
                    50% of revenue
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Platform fee: 30% (configurable by county via pricing rules)
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <SectionHeader icon={Zap} title="Core Features" />

          <div className="space-y-8">
            <FeatureBlock
              title="Property Valuation"
              items={[
                "AI-powered valuation using RapidCanvas Land Oracle",
                "GPT-4o analysis for market insights",
                "Confidence scoring (0-100%)",
                "Value range estimation (min/max)",
                "Fast-sale estimate calculation",
                "Comparable property analysis with adjustments",
              ]}
            />

            <FeatureBlock
              title="Report Generation"
              items={[
                "HTML and PDF report formats",
                "Gotenberg PDF generation",
                "Risk assessment and flags",
                "Market trends analysis",
                "Investment potential scoring",
                "Secure share links with expiration",
                "Email delivery via Resend",
              ]}
            />

            <FeatureBlock
              title="Evidence Collection"
              items={[
                "Photo upload with geolocation tagging",
                "Video evidence support",
                "Document attachment (PDFs)",
                "EXIF data capture",
                "SHA-256 integrity hashing",
                "Geofencing validation (500m radius)",
                "Required categories: Front, Rear, Street View",
              ]}
            />

            <FeatureBlock
              title="Interactive Map"
              items={[
                "MapLibre GL + Mapbox integration",
                "Real-time job markers with status",
                "Appraiser coverage zones visualization",
                "Property search by address",
                "Texas boundary data",
                "Click-to-request from map",
              ]}
            />

            <FeatureBlock
              title="DD Marketplace"
              items={[
                "Buy and sell completed reports",
                "Browse by category and property type",
                "20% platform fee on sales",
                "View count and popularity metrics",
                "Featured listings support",
                "Download limit tracking",
              ]}
            />
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="mb-20">
          <SectionHeader icon={TrendingUp} title="Workflows" />

          <h3 className="text-xl font-semibold text-white mb-6">
            Appraisal Request Flow
          </h3>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />
            <div className="space-y-8">
              <WorkflowStep
                number={1}
                title="Request Created"
                status="DRAFT"
                description="Client submits appraisal request with property address and type selection."
              />
              <WorkflowStep
                number={2}
                title="Payment Processing"
                status="QUEUED"
                description="Stripe checkout completed. Request moves to processing queue."
              />
              <WorkflowStep
                number={3}
                title="AI Processing"
                status="RUNNING"
                description="RapidCanvas valuation, OpenAI analysis, comparable search. ~5-30 minutes."
              />
              <WorkflowStep
                number={4}
                title="Report Generation"
                status="READY"
                description="PDF generated via Gotenberg. Report available for download."
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-16 mb-6">
            Job Dispatch Flow (On-Site/Certified)
          </h3>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />
            <div className="space-y-8">
              <WorkflowStep
                number={1}
                title="Job Created"
                status="PENDING_DISPATCH"
                description="Job created after appraisal payment. Awaiting dispatch to appraiser."
              />
              <WorkflowStep
                number={2}
                title="Dispatched"
                status="DISPATCHED"
                description="Job assigned to available appraiser in coverage area. SLA timer starts."
              />
              <WorkflowStep
                number={3}
                title="Accepted"
                status="ACCEPTED"
                description="Appraiser accepts job. Scheduling window confirmed."
              />
              <WorkflowStep
                number={4}
                title="In Progress"
                status="IN_PROGRESS"
                description="Appraiser conducts inspection. Uploads evidence with geolocation."
              />
              <WorkflowStep
                number={5}
                title="Submitted"
                status="SUBMITTED"
                description="Appraiser submits completed work for review."
              />
              <WorkflowStep
                number={6}
                title="Completed"
                status="COMPLETED"
                description="Job approved. Appraiser payout processed. Final report generated."
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-16 mb-6">
            Appraisal Statuses
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <StatusCard
              status="DRAFT"
              color="gray"
              description="Initial creation, awaiting payment"
            />
            <StatusCard
              status="QUEUED"
              color="blue"
              description="Waiting to be processed"
            />
            <StatusCard
              status="RUNNING"
              color="yellow"
              description="AI is analyzing property"
            />
            <StatusCard
              status="READY"
              color="green"
              description="Report completed"
            />
            <StatusCard
              status="FAILED"
              color="red"
              description="Processing failed, retry available"
            />
            <StatusCard
              status="EXPIRED"
              color="gray"
              description="Request cancelled/expired"
            />
          </div>
        </section>

        {/* Users Section */}
        <section id="users" className="mb-20">
          <SectionHeader icon={Users} title="User Roles" />

          <div className="space-y-8">
            <RoleCard
              role="Client"
              icon={Briefcase}
              description="Real estate professionals requesting appraisals"
              capabilities={[
                "Request AI, On-Site, or Certified appraisals",
                "Browse interactive property map",
                "View appraisal history and download reports",
                "Share reports via secure links",
                "Manage organization team members",
                "Subscribe to plans and manage billing",
                "Access DD Marketplace",
              ]}
            />

            <RoleCard
              role="Appraiser"
              icon={Camera}
              description="Licensed professionals conducting inspections"
              capabilities={[
                "View and accept assigned jobs",
                "Track job status through workflow",
                "Upload evidence with geolocation",
                "View earnings and request payouts",
                "Update profile and availability",
                "Submit license for verification",
                "View coverage area on map",
              ]}
              extraInfo={{
                title: "License Levels",
                items: [
                  "TRAINEE - Under supervision",
                  "LICENSED - Residential up to $1M",
                  "CERTIFIED_RESIDENTIAL - All residential",
                  "CERTIFIED_GENERAL - All property types",
                ],
              }}
            />

            <RoleCard
              role="Admin"
              icon={Settings}
              description="Platform administrators managing operations"
              capabilities={[
                "View platform dashboard and analytics",
                "Monitor SLA compliance",
                "Manage appraiser verification",
                "Process appraiser payouts",
                "Manage pricing rules",
                "Handle disputes and escalations",
                "Configure system settings",
              ]}
            />
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="mb-20">
          <SectionHeader icon={Server} title="Technical Architecture" />

          <h3 className="text-xl font-semibold text-white mb-6">Tech Stack</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <TechCard
              title="Frontend"
              items={[
                { name: "Next.js", version: "16.1.1" },
                { name: "React", version: "19.2.3" },
                { name: "Tailwind CSS", version: "4" },
                { name: "MapLibre GL", version: "5.15.0" },
                { name: "Zustand", version: "5.0.9" },
                { name: "Framer Motion", version: "12.23.26" },
              ]}
            />
            <TechCard
              title="Backend"
              items={[
                { name: "tRPC", version: "11.8.1" },
                { name: "Prisma", version: "6.19.1" },
                { name: "NextAuth", version: "5.0.0-beta" },
                { name: "PostgreSQL", version: "Latest" },
                { name: "Zod", version: "Validation" },
              ]}
            />
          </div>

          <h3 className="text-xl font-semibold text-white mb-6">
            Application Structure
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <AppRouteCard
              title="Client App"
              path="/(client)"
              routes={[
                "/appraisals",
                "/appraisals/new",
                "/appraisals/[id]",
                "/map",
                "/orders",
                "/dashboard",
                "/billing",
                "/team",
                "/marketplace",
              ]}
            />
            <AppRouteCard
              title="Appraiser App"
              path="/appraiser"
              routes={[
                "/dashboard",
                "/jobs",
                "/jobs/[id]",
                "/jobs/[id]/evidence",
                "/earnings",
                "/profile",
                "/onboarding",
              ]}
            />
            <AppRouteCard
              title="Admin App"
              path="/admin"
              routes={[
                "/dashboard",
                "/appraisers",
                "/jobs",
                "/organizations",
                "/disputes",
                "/pricing",
                "/analytics",
              ]}
            />
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="mb-20">
          <SectionHeader icon={Globe} title="External Integrations" />

          <div className="grid md:grid-cols-2 gap-6">
            <IntegrationCard
              name="Stripe"
              purpose="Payment Processing"
              features={[
                "Checkout sessions",
                "Subscription management",
                "Connect payouts",
                "Refund processing",
              ]}
            />
            <IntegrationCard
              name="RapidCanvas"
              purpose="AI Valuation"
              features={[
                "Land Oracle prediction",
                "Property valuation",
                "Confidence scoring",
                "Market comparables",
              ]}
            />
            <IntegrationCard
              name="OpenAI"
              purpose="Property Analysis"
              features={[
                "GPT-4o analysis",
                "Market insights",
                "Investment potential",
                "Neighborhood analysis",
              ]}
            />
            <IntegrationCard
              name="ATTOM Data"
              purpose="Property Database"
              features={[
                "Property attributes",
                "Historical sales",
                "Tax assessments",
                "Parcel information",
              ]}
            />
            <IntegrationCard
              name="Mapbox"
              purpose="Geocoding & Maps"
              features={[
                "Address search",
                "Geocoding",
                "Map tiles",
                "Boundary data",
              ]}
            />
            <IntegrationCard
              name="Gotenberg"
              purpose="PDF Generation"
              features={[
                "HTML to PDF",
                "Report templates",
                "Branded documents",
              ]}
            />
            <IntegrationCard
              name="Cloudflare R2"
              purpose="File Storage"
              features={[
                "Report PDFs",
                "Evidence photos",
                "License documents",
                "Presigned URLs",
              ]}
            />
            <IntegrationCard
              name="Resend"
              purpose="Email Delivery"
              features={[
                "Report delivery",
                "Team invitations",
                "Notifications",
                "Status updates",
              ]}
            />
          </div>
        </section>

        {/* Database Section */}
        <section id="database" className="mb-20">
          <SectionHeader icon={Database} title="Database Schema" />

          <div className="space-y-6">
            <SchemaTable
              name="Users"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "email", type: "String", unique: true },
                {
                  name: "role",
                  type: "Enum",
                  values: "CLIENT, APPRAISER, ADMIN, SUPER_ADMIN",
                },
                {
                  name: "status",
                  type: "Enum",
                  values: "PENDING, ACTIVE, SUSPENDED",
                },
                { name: "organizationId", type: "String", optional: true },
              ]}
            />

            <SchemaTable
              name="Organizations"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "name", type: "String" },
                { name: "slug", type: "String", unique: true },
                {
                  name: "plan",
                  type: "Enum",
                  values: "FREE_TRIAL, STARTER, PROFESSIONAL, ENTERPRISE",
                },
                { name: "stripeCustomerId", type: "String", optional: true },
              ]}
            />

            <SchemaTable
              name="AppraisalRequests"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "referenceCode", type: "String", unique: true },
                {
                  name: "status",
                  type: "Enum",
                  values: "DRAFT, QUEUED, RUNNING, READY, FAILED, EXPIRED",
                },
                {
                  name: "requestedType",
                  type: "Enum",
                  values:
                    "AI_REPORT, AI_REPORT_WITH_ONSITE, CERTIFIED_APPRAISAL",
                },
                { name: "propertyId", type: "String" },
                { name: "reportId", type: "String", optional: true },
                { name: "price", type: "Decimal" },
              ]}
            />

            <SchemaTable
              name="Reports"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "valueEstimate", type: "Decimal" },
                { name: "confidenceScore", type: "Int" },
                { name: "comps", type: "Json" },
                { name: "riskFlags", type: "Json" },
                { name: "pdfUrl", type: "String", optional: true },
              ]}
            />

            <SchemaTable
              name="Jobs"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "jobNumber", type: "String", unique: true },
                {
                  name: "jobType",
                  type: "Enum",
                  values: "ONSITE_PHOTOS, CERTIFIED_APPRAISAL",
                },
                {
                  name: "status",
                  type: "Enum",
                  values:
                    "PENDING_DISPATCH, DISPATCHED, ACCEPTED, IN_PROGRESS, SUBMITTED, COMPLETED, CANCELLED, FAILED",
                },
                { name: "assignedAppraiserId", type: "String", optional: true },
                { name: "slaDueAt", type: "DateTime" },
              ]}
            />

            <SchemaTable
              name="Evidence"
              fields={[
                { name: "id", type: "String", key: true },
                { name: "jobId", type: "String" },
                {
                  name: "mediaType",
                  type: "Enum",
                  values: "PHOTO, VIDEO, DOCUMENT",
                },
                { name: "fileUrl", type: "String" },
                { name: "latitude", type: "Float", optional: true },
                { name: "longitude", type: "Float", optional: true },
                { name: "integrityHash", type: "String" },
              ]}
            />
          </div>
        </section>

        {/* API Section */}
        <section id="api" className="mb-20">
          <SectionHeader icon={Code} title="API Reference" />

          <p className="text-gray-400 mb-8">
            TruPlat uses tRPC for end-to-end type-safe API calls. All procedures
            are organized into routers.
          </p>

          <div className="space-y-6">
            <ApiRouter
              name="appraisal"
              procedures={[
                { name: "create", type: "mutation", auth: "client" },
                { name: "getById", type: "query", auth: "protected" },
                { name: "list", type: "query", auth: "client" },
                {
                  name: "createWithCheckout",
                  type: "mutation",
                  auth: "client",
                },
                { name: "quickAIReport", type: "mutation", auth: "client" },
                { name: "delete", type: "mutation", auth: "client" },
                { name: "bulkDelete", type: "mutation", auth: "client" },
                { name: "retry", type: "mutation", auth: "client" },
              ]}
            />

            <ApiRouter
              name="report"
              procedures={[
                { name: "getById", type: "query", auth: "protected" },
                { name: "download", type: "mutation", auth: "protected" },
                { name: "share", type: "mutation", auth: "client" },
                { name: "getShared", type: "query", auth: "public" },
                { name: "emailReport", type: "mutation", auth: "client" },
                { name: "regenerate", type: "mutation", auth: "admin" },
              ]}
            />

            <ApiRouter
              name="job"
              procedures={[
                { name: "listForOrganization", type: "query", auth: "client" },
                { name: "getForAppraiser", type: "query", auth: "appraiser" },
                { name: "updateStatus", type: "mutation", auth: "appraiser" },
                { name: "assignAppraiser", type: "mutation", auth: "admin" },
              ]}
            />

            <ApiRouter
              name="billing"
              procedures={[
                { name: "subscription.get", type: "query", auth: "client" },
                {
                  name: "subscription.update",
                  type: "mutation",
                  auth: "client",
                },
                { name: "checkout", type: "mutation", auth: "client" },
                { name: "usage", type: "query", auth: "client" },
              ]}
            />

            <ApiRouter
              name="admin"
              procedures={[
                { name: "dashboard.stats", type: "query", auth: "admin" },
                { name: "pricing.list", type: "query", auth: "admin" },
                { name: "pricing.create", type: "mutation", auth: "admin" },
                { name: "analytics.*", type: "query", auth: "admin" },
              ]}
            />
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-20">
          <SectionHeader icon={Shield} title="Security" />

          <div className="grid md:grid-cols-2 gap-6">
            <SecurityCard
              title="Authentication"
              items={[
                "NextAuth v5 with bcrypt password hashing",
                "Session-based authentication",
                "Role-based access control (RBAC)",
                "Organization-scoped permissions",
              ]}
            />
            <SecurityCard
              title="Data Protection"
              items={[
                "End-to-end encryption for sensitive data",
                "Secure share links with tokens",
                "Time-limited presigned URLs",
                "PCI compliance via Stripe",
              ]}
            />
            <SecurityCard
              title="Evidence Integrity"
              items={[
                "SHA-256 integrity hashing",
                "EXIF data capture",
                "Geofencing validation (500m)",
                "Device information logging",
              ]}
            />
            <SecurityCard
              title="Access Control"
              items={[
                "Organization isolation",
                "User role enforcement",
                "API rate limiting",
                "Audit logging",
              ]}
            />
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-6">
              File Handling Limits
            </h3>
            <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Max Image Size
                  </h4>
                  <p className="text-white font-mono">10 MB</p>
                </div>
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Max PDF Size
                  </h4>
                  <p className="text-white font-mono">50 MB</p>
                </div>
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Allowed Images
                  </h4>
                  <p className="text-gray-400">JPEG, PNG, WebP</p>
                </div>
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Allowed Documents
                  </h4>
                  <p className="text-gray-400">PDF</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Component definitions

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
      <div className="w-10 h-10 flex items-center justify-center bg-lime-400/10 border border-lime-400/30 clip-notch-sm">
        <Icon className="w-5 h-5 text-lime-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <Icon className="w-8 h-8 text-lime-400 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 text-center clip-notch-sm">
      <p className="text-2xl font-bold text-lime-400 font-mono">{value}</p>
      <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

function PricingCard({
  tier,
  name,
  price,
  subtitle,
  features,
  popular,
}: {
  tier: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  popular?: boolean;
}) {
  const tierColors: Record<string, string> = {
    free: "border-emerald-400/30",
    basic: "border-cyan-400/30",
    popular: "border-lime-400",
    premium: "border-amber-400/30",
  };

  return (
    <div
      className={`relative bg-gray-900 border p-6 clip-notch ${tierColors[tier] || "border-gray-800"}`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-400 text-black font-mono text-xs uppercase tracking-wider">
          Popular
        </span>
      )}
      <h4 className="font-mono text-lg uppercase tracking-wider text-white mb-1">
        {name}
      </h4>
      <p className="text-2xl font-bold text-lime-400 mb-1">{price}</p>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <h4 className="font-mono text-sm uppercase tracking-wider text-lime-400 mb-4">
        {title}
      </h4>
      <ul className="grid md:grid-cols-2 gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-gray-400"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  status,
  description,
}: {
  number: number;
  title: string;
  status: string;
  description: string;
}) {
  return (
    <div className="relative pl-16">
      <div className="absolute left-0 w-12 h-12 bg-gray-900 border border-lime-400/30 clip-notch-sm flex items-center justify-center">
        <span className="text-lime-400 font-mono font-bold">{number}</span>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-semibold text-white">{title}</h4>
          <span className="px-2 py-0.5 bg-gray-800 text-gray-400 font-mono text-xs">
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function StatusCard({
  status,
  color,
  description,
}: {
  status: string;
  color: string;
  description: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: "border-gray-600 text-gray-400",
    blue: "border-blue-400 text-blue-400",
    yellow: "border-yellow-400 text-yellow-400",
    green: "border-green-400 text-green-400",
    red: "border-red-400 text-red-400",
  };

  return (
    <div className={`border p-4 clip-notch-sm ${colorClasses[color]}`}>
      <p className="font-mono text-sm font-bold mb-1">{status}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

function RoleCard({
  role,
  icon: Icon,
  description,
  capabilities,
  extraInfo,
}: {
  role: string;
  icon: React.ElementType;
  description: string;
  capabilities: string[];
  extraInfo?: { title: string; items: string[] };
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-lime-400/10 border border-lime-400/30 clip-notch-sm">
          <Icon className="w-5 h-5 text-lime-400" />
        </div>
        <div>
          <h4 className="font-mono text-lg uppercase tracking-wider text-white">
            {role}
          </h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <ul className="space-y-2 mb-4">
        {capabilities.map((c) => (
          <li key={c} className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
            {c}
          </li>
        ))}
      </ul>
      {extraInfo && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-2">
            {extraInfo.title}
          </p>
          <ul className="space-y-1">
            {extraInfo.items.map((item) => (
              <li key={item} className="text-xs text-gray-400">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TechCard({
  title,
  items,
}: {
  title: string;
  items: { name: string; version: string }[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <h4 className="font-mono text-sm uppercase tracking-wider text-lime-400 mb-4">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.name} className="flex justify-between text-sm">
            <span className="text-white">{item.name}</span>
            <span className="text-gray-500 font-mono">{item.version}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppRouteCard({
  title,
  path,
  routes,
}: {
  title: string;
  path: string;
  routes: string[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <h4 className="font-mono text-sm uppercase tracking-wider text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-500 font-mono mb-4">{path}</p>
      <ul className="space-y-1">
        {routes.map((route) => (
          <li key={route} className="text-xs text-gray-400 font-mono">
            {route}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntegrationCard({
  name,
  purpose,
  features,
}: {
  name: string;
  purpose: string;
  features: string[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <h4 className="font-mono text-lg uppercase tracking-wider text-white mb-1">
        {name}
      </h4>
      <p className="text-sm text-lime-400 mb-4">{purpose}</p>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
            <ChevronRight className="w-3 h-3 text-gray-600" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchemaTable({
  name,
  fields,
}: {
  name: string;
  fields: {
    name: string;
    type: string;
    key?: boolean;
    unique?: boolean;
    optional?: boolean;
    values?: string;
  }[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 clip-notch overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <h4 className="font-mono text-sm uppercase tracking-wider text-white">
          {name}
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                Field
              </th>
              <th className="text-left py-2 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="text-left py-2 px-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                Flags
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name} className="border-b border-gray-800/50">
                <td className="py-2 px-4 font-mono text-white">{field.name}</td>
                <td className="py-2 px-4 text-gray-400">
                  {field.type}
                  {field.values && (
                    <span className="text-xs text-gray-600 ml-2">
                      ({field.values})
                    </span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {field.key && (
                    <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 text-xs font-mono mr-1">
                      PK
                    </span>
                  )}
                  {field.unique && (
                    <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 text-xs font-mono mr-1">
                      UQ
                    </span>
                  )}
                  {field.optional && (
                    <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs font-mono">
                      ?
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiRouter({
  name,
  procedures,
}: {
  name: string;
  procedures: { name: string; type: string; auth: string }[];
}) {
  const authColors: Record<string, string> = {
    public: "text-gray-400",
    protected: "text-blue-400",
    client: "text-lime-400",
    appraiser: "text-amber-400",
    admin: "text-red-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 clip-notch overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <h4 className="font-mono text-sm text-white">
          <span className="text-gray-500">trpc.</span>
          <span className="text-lime-400">{name}</span>
        </h4>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {procedures.map((proc) => (
            <li key={proc.name} className="flex items-center gap-3 text-sm">
              <span
                className={`px-1.5 py-0.5 text-xs font-mono ${
                  proc.type === "query"
                    ? "bg-blue-400/10 text-blue-400"
                    : "bg-purple-400/10 text-purple-400"
                }`}
              >
                {proc.type}
              </span>
              <span className="text-white font-mono">{proc.name}</span>
              <span className={`text-xs ${authColors[proc.auth]}`}>
                {proc.auth}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SecurityCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-lime-400" />
        <h4 className="font-mono text-sm uppercase tracking-wider text-white">
          {title}
        </h4>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-gray-400"
          >
            <CheckCircle className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
