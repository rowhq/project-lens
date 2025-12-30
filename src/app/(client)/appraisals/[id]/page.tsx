"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Home,
  User,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  X,
  Link as LinkIcon,
  Send,
  Check,
  Lock,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Share Modal Component
function ShareModal({
  isOpen,
  onClose,
  reportId,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [allowDownload, setAllowDownload] = useState(true);
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareMutation = trpc.report.share.useMutation({
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
    },
  });

  const handleShare = async () => {
    await shareMutation.mutateAsync({
      reportId,
      expiresInDays,
      allowDownload,
      password: usePassword && password ? password : undefined,
    });
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Share Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Link Expires In
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowDownload"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="allowDownload" className="text-sm text-card-foreground">
                Allow PDF download
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="usePassword"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="usePassword" className="text-sm text-card-foreground">
                  Password protect
                </label>
              </div>
              {usePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                />
              )}
            </div>

            <button
              onClick={handleShare}
              disabled={shareMutation.isPending || (usePassword && !password)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {shareMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Create Share Link
                </>
              )}
            </button>

            {shareMutation.isError && (
              <p className="text-sm text-destructive text-center">
                Failed to create share link. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Share Link</p>
              <p className="text-sm text-card-foreground break-all font-mono">{shareUrl}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShareUrl(null);
                  onClose();
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
              >
                Done
              </button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expires in {expiresInDays} days
              </p>
              {allowDownload && (
                <p className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download enabled
                </p>
              )}
              {usePassword && password && (
                <p className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password protected
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Email Modal Component
function EmailModal({
  isOpen,
  onClose,
  reportId,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [includeDownload, setIncludeDownload] = useState(true);
  const [sent, setSent] = useState(false);

  const emailMutation = trpc.report.emailReport.useMutation({
    onSuccess: () => {
      setSent(true);
    },
  });

  const handleSend = async () => {
    await emailMutation.mutateAsync({
      reportId,
      recipientEmail,
      message: message || undefined,
      includeDownloadLink: includeDownload,
    });
  };

  const handleClose = () => {
    setRecipientEmail("");
    setMessage("");
    setSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Email Report</h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!sent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeDownload"
                checked={includeDownload}
                onChange={(e) => setIncludeDownload(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="includeDownload" className="text-sm text-card-foreground">
                Include download link
              </label>
            </div>

            <button
              onClick={handleSend}
              disabled={emailMutation.isPending || !recipientEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {emailMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>

            {emailMutation.isError && (
              <p className="text-sm text-destructive text-center">
                Failed to send email. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Email Sent!</h3>
            <p className="text-muted-foreground mb-6">
              The report has been sent to {recipientEmail}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppraisalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: appraisal, isLoading } = trpc.appraisal.getById.useQuery({ id });

  // Get existing share link
  const { data: existingShareLink } = trpc.report.getShareLink.useQuery(
    { reportId: appraisal?.report?.id || "" },
    { enabled: !!appraisal?.report?.id }
  );

  // Create share link mutation for quick copy
  const shareMutation = trpc.report.share.useMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading appraisal...</p>
        </div>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Appraisal not found</p>
        <Link href="/appraisals" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to appraisals
        </Link>
      </div>
    );
  }

  const report = appraisal.report;
  const property = appraisal.property;
  const valueChange = report?.valueEstimate
    ? ((Number(report.valueEstimate) - 300000) / 300000) * 100
    : 0;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/appraisals" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{appraisal.referenceCode}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appraisal.status]}`}>
                {appraisal.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500">{property?.addressFull}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report?.pdfUrl && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <a
                href={report.pdfUrl}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {report && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reportId={report.id}
        />
      )}

      {/* Email Modal */}
      {report && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          reportId={report.id}
        />
      )}

      {/* Value Summary */}
      {report && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-blue-200 text-sm">Estimated Value</p>
              <p className="text-3xl font-bold">${Number(report.valueEstimate).toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {valueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-300" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-300" />
                )}
                <span className={valueChange >= 0 ? "text-green-300" : "text-red-300"}>
                  {valueChange >= 0 ? "+" : ""}
                  {valueChange.toFixed(1)}% vs market
                </span>
              </div>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Value Range</p>
              <p className="text-xl font-semibold">
                ${Number(report.valueRangeMin).toLocaleString()} - $
                {Number(report.valueRangeMax).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Confidence Score</p>
              <p className="text-xl font-semibold">{report.confidenceScore}%</p>
              <div className="w-full bg-blue-800 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full"
                  style={{ width: `${report.confidenceScore}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Report Type</p>
              <p className="text-xl font-semibold">{report.type.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Property Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Property Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium text-gray-900">{property?.propertyType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Square Feet</p>
                <p className="font-medium text-gray-900">{property?.sqft?.toLocaleString() || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Built</p>
                <p className="font-medium text-gray-900">{property?.yearBuilt || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-medium text-gray-900">{property?.bedrooms || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-medium text-gray-900">{property?.bathrooms || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lot Size</p>
                <p className="font-medium text-gray-900">
                  {property?.lotSizeSqft ? `${(property.lotSizeSqft / 43560).toFixed(2)} acres` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
              <p className="text-gray-700 mb-4">
                {(report.aiAnalysis as { summary?: string })?.summary}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {((report.aiAnalysis as { strengths?: string[] })?.strengths || []).map(
                      (strength: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600">
                          • {strength}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Considerations
                  </h3>
                  <ul className="space-y-1">
                    {((report.aiAnalysis as { concerns?: string[] })?.concerns || []).map(
                      (concern: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600">
                          • {concern}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Comparable Sales */}
          {report?.comps && Array.isArray(report.comps) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparable Sales</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sale Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sq Ft
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Distance
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Match
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(report.comps as Array<{
                      address: string;
                      salePrice: number;
                      sqft: number;
                      distance: number;
                      similarityScore: number;
                    }>).slice(0, 5).map((comp, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm text-gray-900">{comp.address}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${comp.salePrice?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {comp.sqft?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {comp.distance?.toFixed(1)} mi
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
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

          {/* Risk Flags */}
          {report?.riskFlags && Array.isArray(report.riskFlags) && (report.riskFlags as Array<{
            type: string;
            severity: string;
            description: string;
            recommendation: string;
          }>).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
              <div className="space-y-3">
                {(report.riskFlags as Array<{
                  type: string;
                  severity: string;
                  description: string;
                  recommendation: string;
                }>).map((risk, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-l-4 ${
                      risk.severity === "HIGH"
                        ? "bg-red-50 border-red-500"
                        : risk.severity === "MEDIUM"
                        ? "bg-yellow-50 border-yellow-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    <p className="font-medium text-gray-900">{risk.type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                    <p className="text-sm text-gray-500 mt-1 italic">{risk.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium text-gray-900">{appraisal.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price Paid</p>
                  <p className="font-medium text-gray-900">${Number(appraisal.price).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Report */}
          {report && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Share Report</h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (existingShareLink?.url) {
                      await navigator.clipboard.writeText(existingShareLink.url);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    } else {
                      // Create a new share link and copy it
                      const result = await shareMutation.mutateAsync({
                        reportId: report.id,
                        expiresInDays: 7,
                        allowDownload: true,
                      });
                      await navigator.clipboard.writeText(result.shareUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                  disabled={shareMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground disabled:opacity-50"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : shareMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
                >
                  <Mail className="w-4 h-4" />
                  Email Report
                </button>
              </div>
              {existingShareLink && (
                <p className="text-xs text-muted-foreground mt-3">
                  Active link expires {new Date(existingShareLink.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Need Help */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Have questions about this appraisal or need a different report type?
            </p>
            <a
              href="mailto:support@projectlens.com?subject=Support Request - Appraisal"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Phone className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
