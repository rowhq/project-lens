/**
 * Shared Report Page
 * Public page for viewing shared reports via token
 */

"use client";

import { use, useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  FileText,
  Download,
  Lock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Home,
  Eye,
  Clock,
} from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function SharedReportPage({ params }: PageProps) {
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.report.getShared.useQuery(
    { token, password: password || undefined },
    { retry: false }
  );

  const downloadMutation = trpc.report.downloadShared.useMutation();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    try {
      await refetch();
    } catch {
      setPasswordError("Incorrect password");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      const result = await downloadMutation.mutateAsync({
        token,
        password: password || undefined,
      });
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadError("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isExpired = error.message.includes("expired");
    const isRevoked = error.message.includes("revoked");
    const isLimitReached = error.message.includes("limit");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground mb-2">
            {isExpired
              ? "Link Expired"
              : isRevoked
              ? "Link Revoked"
              : isLimitReached
              ? "View Limit Reached"
              : "Unable to Access Report"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isExpired
              ? "This share link has expired. Please request a new link from the report owner."
              : isRevoked
              ? "This share link has been revoked by the owner."
              : isLimitReached
              ? "This share link has reached its maximum view limit."
              : error.message || "The report could not be loaded."}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to TruPlat
          </a>
        </div>
      </div>
    );
  }

  // Password required state
  if (data?.requiresPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground mb-2">Password Protected</h1>
            <p className="text-muted-foreground">
              This report is password protected. Enter the password to view.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              View Report
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Report view
  const report = data?.report;
  const property = data?.property;
  const allowDownload = data?.allowDownload;

  if (!report || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Report data not available.</p>
        </div>
      </div>
    );
  }

  const valueChange = report.valueEstimate
    ? ((Number(report.valueEstimate) - 300000) / 300000) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-card-foreground">TruPlat</h1>
              <p className="text-xs text-muted-foreground">Property Valuation Report</p>
            </div>
          </div>
          {allowDownload && (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </button>
              {downloadError && (
                <p className="text-xs text-destructive">{downloadError}</p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-card-foreground mb-1 truncate">
                {property.addressFull}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.state} {property.zipCode}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Value Summary */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 mb-6 text-primary-foreground">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Estimated Value</p>
              <p className="text-3xl font-bold">${Number(report.valueEstimate).toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-sm">
                {valueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {valueChange >= 0 ? "+" : ""}
                  {valueChange.toFixed(1)}% vs market
                </span>
              </div>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Value Range</p>
              <p className="text-lg font-semibold">
                ${Number(report.valueRangeMin).toLocaleString()} - $
                {Number(report.valueRangeMax).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Confidence Score</p>
              <p className="text-lg font-semibold">{report.confidenceScore}%</p>
              <div className="w-full bg-primary-foreground/20 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-foreground h-2 rounded-full"
                  style={{ width: `${report.confidenceScore}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Report Type</p>
              <p className="text-lg font-semibold">{report.type.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Property Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium text-card-foreground">
                    {property.propertyType?.replace(/_/g, " ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="font-medium text-card-foreground">
                    {property.sqft?.toLocaleString() || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium text-card-foreground">{property.yearBuilt || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium text-card-foreground">{property.bedrooms || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium text-card-foreground">{property.bathrooms || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-medium text-card-foreground">
                    {property.lotSizeSqft ? `${(property.lotSizeSqft / 43560).toFixed(2)} acres` : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {report.aiAnalysis && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">AI Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  {(report.aiAnalysis as { summary?: string })?.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {((report.aiAnalysis as { strengths?: string[] })?.strengths || []).map(
                        (strength: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            - {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {((report.aiAnalysis as { concerns?: string[] })?.concerns || []).map(
                        (concern: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            - {concern}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Comparable Sales */}
            {report.comps && Array.isArray(report.comps) && (report.comps as unknown[]).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  Comparable Sales ({report.compsCount})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Address
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Sale Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Sq Ft
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Distance
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Match
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(
                        report.comps as Array<{
                          address: string;
                          salePrice: number;
                          sqft: number;
                          distance: number;
                          similarityScore: number;
                        }>
                      )
                        .slice(0, 5)
                        .map((comp, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm text-card-foreground">{comp.address}</td>
                            <td className="px-4 py-3 text-sm text-card-foreground">
                              ${comp.salePrice?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {comp.sqft?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {comp.distance?.toFixed(1)} mi
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                {comp.similarityScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-4">Report Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Generated</p>
                    <p className="font-medium text-card-foreground">
                      {new Date(report.generatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Report Type</p>
                    <p className="font-medium text-card-foreground">{report.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 rounded-xl border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                This valuation report is provided for informational purposes only. It is not a
                certified appraisal and should not be used as the sole basis for any financial
                decision. For certified appraisals, please consult a licensed appraiser.
              </p>
            </div>

            {/* Download Button */}
            {allowDownload && (
              <>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? "Downloading..." : "Download Full Report"}
                </button>
                {downloadError && (
                  <p className="text-sm text-destructive text-center mt-2">{downloadError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">TruPlat</span> - Fast Appraisals for
            Lenders
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
