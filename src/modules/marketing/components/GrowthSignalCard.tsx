"use client";

import { TrendingUp, Clock } from "lucide-react";
import type { ReactNode } from "react";

interface GrowthSignalCardProps {
  icon: ReactNode;
  type: string;
  example: string;
  impact: string;
  lag: string;
}

export function GrowthSignalCard({
  icon,
  type,
  example,
  impact,
  lag,
}: GrowthSignalCardProps) {
  return (
    <div className="group relative bg-gray-900 border border-gray-800 p-6 hover:border-lime-500/50 transition-all clip-notch">
      {/* L-bracket corners on hover */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="w-12 h-12 bg-lime-500/10 border border-lime-500/30 clip-notch-sm flex items-center justify-center mb-4 text-lime-400">
        {icon}
      </div>

      <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-2">
        {type}
      </p>

      <p className="text-white text-sm mb-4">{example}</p>

      <div className="pt-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-lime-400" />
          <span className="text-sm text-gray-400">{impact}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">{lag}</span>
        </div>
      </div>
    </div>
  );
}

export default GrowthSignalCard;
