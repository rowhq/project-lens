"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

interface VideoModalProps {
  thumbnailUrl?: string;
  videoUrl?: string;
}

export function VideoModal({ videoUrl }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] aspect-video w-full max-w-2xl mx-auto"
      >
        {/* Placeholder thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Play button */}
            <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
            <p className="mt-4 text-[var(--foreground)] font-semibold">
              Watch Demo (2 min)
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              See TruPlat in action
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--card)]/80 backdrop-blur-sm rounded-lg border border-[var(--border)]">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-[var(--foreground)]">Product Demo</span>
        </div>

        {/* Fake browser chrome for context */}
        <div className="absolute bottom-4 left-4 right-4 h-16 bg-[var(--card)]/60 backdrop-blur-sm rounded-lg border border-[var(--border)] flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
            <div className="w-3 h-3 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 h-8 bg-[var(--secondary)] rounded-md flex items-center px-3">
            <span className="text-xs text-[var(--muted-foreground)]">
              app.truplat.com
            </span>
          </div>
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl aspect-video bg-[var(--card)] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[var(--card)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--foreground)]" />
              </button>

              {/* Video placeholder */}
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
                  <div className="w-24 h-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                    <Play className="w-12 h-12 text-[var(--primary)]" />
                  </div>
                  <p className="text-xl font-semibold text-[var(--foreground)]">
                    Product Demo
                  </p>
                  <p className="text-[var(--muted-foreground)] mt-2">
                    Schedule a personalized demo with our team
                  </p>
                  <a
                    href="mailto:demo@truplat.com?subject=TruPlat Demo Request"
                    className="mt-4 px-6 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90"
                  >
                    Request Demo
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Inline video trigger for hero section
export function VideoTriggerButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--secondary)] transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-[var(--foreground)]">Watch Demo</p>
        <p className="text-xs text-[var(--muted-foreground)]">2 min overview</p>
      </div>
    </button>
  );
}
