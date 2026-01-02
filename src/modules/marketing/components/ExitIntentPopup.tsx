"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight, Loader2 } from "lucide-react";

const STORAGE_KEY = "truplat_exit_popup_dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    // Check if popup was recently dismissed
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return; // Don't show popup
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the viewport
      if (e.clientY <= 0 && !isVisible) {
        setIsVisible(true);
      }
    };

    // Add listener after a delay to avoid triggering immediately
    const timeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus("success");

    // Dismiss after success
    setTimeout(() => {
      handleDismiss();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>

            {/* Gradient header */}
            <div className="h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />

            <div className="p-8">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    You&apos;re In!
                  </h3>
                  <p className="mt-2 text-[var(--muted-foreground)]">
                    Check your email for your discount code
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                    <Gift className="w-8 h-8 text-[var(--primary)]" />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">
                      Wait! Don&apos;t Miss This
                    </h3>
                    <p className="mt-2 text-[var(--muted-foreground)]">
                      Get{" "}
                      <span className="text-[var(--primary)] font-semibold">
                        50% off
                      </span>{" "}
                      your first report when you sign up now
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={status === "loading"}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                      required
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full px-6 py-3 bg-[var(--primary)] text-black font-semibold rounded-xl hover:bg-[var(--accent)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Claim My 50% Discount
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
                    No spam. Unsubscribe anytime. Limited time offer.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
