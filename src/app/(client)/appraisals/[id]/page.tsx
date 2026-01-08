"use client";

/**
 * Appraisal Detail - Mockup Version
 */

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Home,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Types
interface MockAppraisal {
  id: string;
  referenceCode: string;
  status: string;
  requestedType: string;
  purpose: string;
  price: number;
  createdAt: string;
  property: {
    addressLine1: string;
    addressFull: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    sqft: number;
    yearBuilt: number;
    bedrooms: number;
    bathrooms: number;
    lotSizeSqft: number;
  };
  report: {
    id: string;
    type: string;
    valueEstimate: number;
    valueRangeMin: number;
    valueRangeMax: number;
    confidenceScore: number;
    aiAnalysis: {
      summary: string;
      strengths: string[];
      concerns: string[];
    };
    comps: Array<{
      address: string;
      salePrice: number;
      sqft: number;
      distance: number;
      similarityScore: number;
    }>;
  } | null;
}

// Mock appraisal data
const MOCK_APPRAISALS: Record<string, MockAppraisal> = {
  "1": {
    id: "1",
    referenceCode: "APR-2024-001",
    status: "READY",
    requestedType: "AI_REPORT",
    purpose: "Purchase",
    price: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    property: {
      addressLine1: "1847 Oak Avenue",
      addressFull: "1847 Oak Avenue, Austin, TX 78701",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "SINGLE_FAMILY",
      sqft: 2450,
      yearBuilt: 2018,
      bedrooms: 4,
      bathrooms: 3,
      lotSizeSqft: 8712,
    },
    report: {
      id: "r1",
      type: "AI_REPORT",
      valueEstimate: 485000,
      valueRangeMin: 465000,
      valueRangeMax: 510000,
      confidenceScore: 87,
      aiAnalysis: {
        summary:
          "This property is well-positioned in a growing Austin neighborhood with excellent school ratings and increasing home values. Recent comparable sales support the estimated value range.",
        strengths: [
          "Modern construction (2018) with contemporary features",
          "Excellent school district (rated 9/10)",
          "Strong neighborhood appreciation trend (+8% YoY)",
          "Energy-efficient construction",
        ],
        concerns: [
          "Higher property taxes compared to surrounding areas",
          "Limited backyard space relative to lot size",
        ],
      },
      comps: [
        {
          address: "1823 Oak Avenue",
          salePrice: 479000,
          sqft: 2380,
          distance: 0.1,
          similarityScore: 94,
        },
        {
          address: "1901 Maple Street",
          salePrice: 492000,
          sqft: 2520,
          distance: 0.3,
          similarityScore: 91,
        },
        {
          address: "2045 Cedar Lane",
          salePrice: 475000,
          sqft: 2400,
          distance: 0.5,
          similarityScore: 88,
        },
      ],
    },
  },
  "2": {
    id: "2",
    referenceCode: "APR-2024-002",
    status: "RUNNING",
    requestedType: "CERTIFIED_APPRAISAL",
    purpose: "Refinance",
    price: 399,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    property: {
      addressLine1: "2301 Maple Drive",
      addressFull: "2301 Maple Drive, Round Rock, TX 78664",
      city: "Round Rock",
      state: "TX",
      zipCode: "78664",
      propertyType: "SINGLE_FAMILY",
      sqft: 3200,
      yearBuilt: 2015,
      bedrooms: 5,
      bathrooms: 4,
      lotSizeSqft: 10890,
    },
    report: null,
  },
  "3": {
    id: "3",
    referenceCode: "APR-2024-003",
    status: "READY",
    requestedType: "AI_REPORT",
    purpose: "Purchase",
    price: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    property: {
      addressLine1: "445 Commerce St",
      addressFull: "445 Commerce St, Pflugerville, TX 78660",
      city: "Pflugerville",
      state: "TX",
      zipCode: "78660",
      propertyType: "TOWNHOUSE",
      sqft: 1850,
      yearBuilt: 2020,
      bedrooms: 3,
      bathrooms: 2.5,
      lotSizeSqft: 3200,
    },
    report: {
      id: "r3",
      type: "AI_REPORT",
      valueEstimate: 320000,
      valueRangeMin: 305000,
      valueRangeMax: 335000,
      confidenceScore: 82,
      aiAnalysis: {
        summary:
          "Modern townhouse in a developing area with good access to tech corridors and improving infrastructure.",
        strengths: [
          "New construction with warranty remaining",
          "Low HOA fees for the area",
          "Proximity to tech employers",
        ],
        concerns: [
          "Limited parking (2 spaces)",
          "Area still developing - some amenities under construction",
        ],
      },
      comps: [
        {
          address: "443 Commerce St",
          salePrice: 315000,
          sqft: 1820,
          distance: 0.01,
          similarityScore: 96,
        },
        {
          address: "501 Commerce St",
          salePrice: 328000,
          sqft: 1880,
          distance: 0.1,
          similarityScore: 92,
        },
      ],
    },
  },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-700/50 text-gray-300 border border-gray-600",
  },
  QUEUED: {
    label: "Queued",
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  },
  RUNNING: {
    label: "Processing",
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  READY: {
    label: "Ready",
    color: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/10 text-red-400 border border-red-500/30",
  },
};

export default function AppraisalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const appraisal = MOCK_APPRAISALS[id] || MOCK_APPRAISALS["1"];
  const report = appraisal.report;
  const property = appraisal.property;
  const status = statusConfig[appraisal.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/appraisals"
            className="p-2 hover:bg-gray-800 clip-notch-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {appraisal.referenceCode}
              </h1>
              <span
                className={`px-3 py-1 clip-notch-sm text-sm font-mono uppercase tracking-wider ${status.color}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {property.addressFull}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report && appraisal.status === "READY" && (
            <>
              <button
                onClick={() => alert("Share functionality would open here")}
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 clip-notch hover:bg-gray-800 text-white font-mono text-sm uppercase tracking-wider"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => alert("PDF download would happen here")}
                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-gray-900 font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {appraisal.status === "RUNNING" && (
        <div className="bg-blue-500/10 border border-blue-500/30 clip-notch p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 clip-notch-sm flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Processing Your Request
              </h3>
              <p className="text-sm text-gray-400">
                Your certified appraisal is being processed. Expected completion
                within 72 hours.
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-800 clip-notch-sm overflow-hidden">
            <div className="h-full bg-blue-400 w-1/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* Value Summary */}
      {report && (
        <div className="relative bg-gray-900 clip-notch border border-lime-400/30 p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
          <div className="absolute -top-px -right-px w-3 h-3 border-r border-t border-lime-400" />
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">
                Estimated Value
              </p>
              <p className="text-3xl font-bold text-lime-400 font-mono">
                ${report.valueEstimate.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">+3.2% vs comps avg</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">
                Value Range
              </p>
              <p className="text-xl font-semibold text-white font-mono">
                ${report.valueRangeMin.toLocaleString()} - $
                {report.valueRangeMax.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">
                Confidence Score
              </p>
              <p className="text-xl font-semibold text-white font-mono">
                {report.confidenceScore}%
              </p>
              <div className="w-full bg-gray-700 clip-notch-sm h-2 mt-2">
                <div
                  className="bg-lime-400 h-2 clip-notch-sm"
                  style={{ width: `${report.confidenceScore}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">
                Report Type
              </p>
              <p className="text-xl font-semibold text-white">
                {report.type.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Property Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-lime-400" />
              Property Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Property Type
                </p>
                <p className="font-medium text-white">
                  {property.propertyType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Square Feet
                </p>
                <p className="font-medium text-white">
                  {property.sqft?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Year Built
                </p>
                <p className="font-medium text-white">{property.yearBuilt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Bedrooms
                </p>
                <p className="font-medium text-white">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Bathrooms
                </p>
                <p className="font-medium text-white">{property.bathrooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  Lot Size
                </p>
                <p className="font-medium text-white">
                  {(property.lotSizeSqft / 43560).toFixed(2)} acres
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                AI Analysis
              </h2>
              <p className="text-gray-300 mb-4">{report.aiAnalysis.summary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lime-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {report.aiAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-gray-400">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Considerations
                  </h3>
                  <ul className="space-y-1">
                    {report.aiAnalysis.concerns.map((c: string, i: number) => (
                      <li key={i} className="text-sm text-gray-400">
                        • {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Comparable Sales */}
          {report?.comps && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Comparable Sales
              </h2>
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-mono font-medium text-gray-400 uppercase">
                      Address
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-mono font-medium text-gray-400 uppercase">
                      Sale Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-mono font-medium text-gray-400 uppercase">
                      Sq Ft
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-mono font-medium text-gray-400 uppercase">
                      Distance
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-mono font-medium text-gray-400 uppercase">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {report.comps.map((comp, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm text-white">
                        {comp.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-mono">
                        ${comp.salePrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {comp.sqft.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {comp.distance} mi
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-lime-400/10 text-lime-400 text-xs clip-notch-sm font-mono">
                          {comp.similarityScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info */}
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Request Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                    Requested
                  </p>
                  <p className="font-medium text-white">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                    Purpose
                  </p>
                  <p className="font-medium text-white">{appraisal.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                    Price Paid
                  </p>
                  <p className="font-medium text-white font-mono">
                    {appraisal.price === 0
                      ? "Free"
                      : `$${appraisal.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-gray-800/50 clip-notch border border-gray-700 p-6">
            <h2 className="font-semibold text-white mb-2">Need Help?</h2>
            <p className="text-sm text-gray-400 mb-4">
              Have questions about this appraisal?
            </p>
            <Link
              href="/support"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
