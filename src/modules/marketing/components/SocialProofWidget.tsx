"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";

// Simulated real-time activity data
const activities = [
  { name: "John D.", city: "Austin", type: "AI Report" },
  { name: "Sarah M.", city: "Houston", type: "On-Site Inspection" },
  { name: "Michael R.", city: "Dallas", type: "Certified Appraisal" },
  { name: "Emily T.", city: "San Antonio", type: "AI Report" },
  { name: "David K.", city: "Fort Worth", type: "On-Site Inspection" },
  { name: "Lisa W.", city: "Plano", type: "AI Report" },
  { name: "James H.", city: "Arlington", type: "Certified Appraisal" },
  { name: "Amanda C.", city: "El Paso", type: "AI Report" },
];

export function SocialProofWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    // Don't show if dismissed
    if (isDismissed) return;

    // Show widget after 3 seconds
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Rotate through activities every 8 seconds
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
      // Randomize time ago
      const times = ["just now", "2 min ago", "5 min ago", "8 min ago"];
      setTimeAgo(times[Math.floor(Math.random() * times.length)]);
    }, 8000);

    // Auto-hide after 30 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 30000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(rotateInterval);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const currentActivity = activities[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 z-40 max-w-sm"
        >
          <div className="glass rounded-xl border border-[var(--border)] p-4 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors"
            >
              <X className="w-3 h-3 text-[var(--muted-foreground)]" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {/* Avatar/Icon */}
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-semibold">
                      {currentActivity.name}
                    </span>{" "}
                    from {currentActivity.city}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Ordered {currentActivity.type} • {timeAgo}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Verified badge */}
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Verified order
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
