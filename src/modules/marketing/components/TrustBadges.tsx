"use client";

import { motion } from "framer-motion";
import { Shield, Award, FileCheck, Building2 } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "SOC 2 Type II",
    description: "Certified",
  },
  {
    icon: Award,
    label: "E&O Insured",
    description: "$2M Coverage",
  },
  {
    icon: FileCheck,
    label: "USPAP",
    description: "Compliant",
  },
  {
    icon: Building2,
    label: "TALCB",
    description: "Licensed",
  },
];

export function TrustBadges() {
  return (
    <div className="py-8 bg-gray-950 border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-wider text-gray-500 text-center mb-6">
          Trusted by Leading Lenders
        </p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800"
            >
              <badge.icon className="w-5 h-5 text-lime-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xs uppercase tracking-wider text-white">
                  {badge.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  {badge.description}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Inline variant for hero section
export function TrustBadgesInline() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-wider text-gray-400">
      <span className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-lime-400" />
        SOC 2
      </span>
      <span className="w-px h-3 bg-gray-700" />
      <span className="flex items-center gap-2">
        <Award className="w-4 h-4 text-lime-400" />
        E&O Insured
      </span>
      <span className="w-px h-3 bg-gray-700" />
      <span className="flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-lime-400" />
        USPAP
      </span>
      <span className="w-px h-3 bg-gray-700" />
      <span className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-lime-400" />
        Texas Licensed
      </span>
    </div>
  );
}
