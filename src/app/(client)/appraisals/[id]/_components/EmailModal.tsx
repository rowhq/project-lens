"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import { X, Send, Check } from "lucide-react";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

export function EmailModal({ isOpen, onClose, reportId }: EmailModalProps) {
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
      <div className="bg-[var(--card)] clip-notch border border-[var(--border)] w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Email Report</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
            aria-label="Close email modal"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {!sent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 bg-[var(--card)] border border-[var(--border)] clip-notch-sm text-white font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-2 bg-[var(--card)] border border-[var(--border)] clip-notch-sm text-white font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeDownload"
                checked={includeDownload}
                onChange={(e) => setIncludeDownload(e.target.checked)}
                className="w-4 h-4 clip-notch-sm border-[var(--border)] bg-[var(--card)] text-lime-400 focus:ring-lime-400"
              />
              <label htmlFor="includeDownload" className="text-sm text-white">
                Include download link
              </label>
            </div>

            <button
              onClick={handleSend}
              disabled={emailMutation.isPending || !recipientEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50"
            >
              {emailMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent clip-notch-sm animate-spin" />
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
              <p className="text-sm text-red-500 text-center">
                Failed to send email. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 clip-notch-sm bg-lime-400/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-lime-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Email Sent!
            </h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              The report has been sent to {recipientEmail}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
