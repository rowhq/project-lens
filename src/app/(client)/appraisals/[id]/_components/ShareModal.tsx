"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Clock,
  Download,
  Lock,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

export function ShareModal({ isOpen, onClose, reportId }: ShareModalProps) {
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
      <div className="bg-[var(--card)] clip-notch border border-[var(--border)] w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Link Expires In
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--card)] border border-[var(--border)] clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
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
                className="w-4 h-4 clip-notch-sm border-[var(--border)] bg-[var(--card)] text-lime-400 focus:ring-lime-400"
              />
              <label htmlFor="allowDownload" className="text-sm text-white">
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
                  className="w-4 h-4 clip-notch-sm border-[var(--border)] bg-[var(--card)] text-lime-400 focus:ring-lime-400"
                />
                <label htmlFor="usePassword" className="text-sm text-white">
                  Password protect
                </label>
              </div>
              {usePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-[var(--card)] border border-[var(--border)] clip-notch-sm text-white font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                />
              )}
            </div>

            <button
              onClick={handleShare}
              disabled={shareMutation.isPending || (usePassword && !password)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50"
            >
              {shareMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent clip-notch-sm animate-spin" />
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
              <p className="text-sm text-red-500 text-center">
                Failed to create share link. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--secondary)] clip-notch-sm">
              <p className="text-sm text-[var(--muted-foreground)] mb-2 font-mono uppercase tracking-wider">
                Share Link
              </p>
              <p className="text-sm text-white break-all font-mono">
                {shareUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
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
                className="px-4 py-2 border border-[var(--border)] clip-notch hover:bg-[var(--secondary)] text-white font-mono text-sm uppercase tracking-wider"
              >
                Done
              </button>
            </div>

            <div className="text-sm text-[var(--muted-foreground)] space-y-1">
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
