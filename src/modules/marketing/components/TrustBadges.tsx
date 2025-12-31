"use client";

import { motion } from "framer-motion";
import { Shield, Award, FileCheck, Building2 } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "SOC 2 Type II",
    description: "Certified",
    color: "text-green-400",
  },
  {
    icon: Award,
    label: "E&O Insured",
    description: "$2M Coverage",
    color: "text-blue-400",
  },
  {
    icon: FileCheck,
    label: "USPAP",
    description: "Compliant",
    color: "text-purple-400",
  },
  {
    icon: Building2,
    label: "TALCB",
    description: "Licensed",
    color: "text-orange-400",
  },
];

export function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8"
    >
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-sm"
        >
          <badge.icon className={`w-4 h-4 ${badge.color}`} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--foreground)]">
              {badge.label}
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {badge.description}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Inline variant for hero section
export function TrustBadgesInline() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted-foreground)]">
      <span className="flex items-center gap-1">
        <Shield className="w-4 h-4 text-green-400" />
        SOC 2
      </span>
      <span className="text-[var(--border)]">|</span>
      <span className="flex items-center gap-1">
        <Award className="w-4 h-4 text-blue-400" />
        E&O Insured
      </span>
      <span className="text-[var(--border)]">|</span>
      <span className="flex items-center gap-1">
        <FileCheck className="w-4 h-4 text-purple-400" />
        USPAP
      </span>
      <span className="text-[var(--border)]">|</span>
      <span className="flex items-center gap-1">
        <Building2 className="w-4 h-4 text-orange-400" />
        Texas Licensed
      </span>
    </div>
  );
}
