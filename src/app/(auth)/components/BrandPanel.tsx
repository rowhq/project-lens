"use client";

/**
 * Brand Panel for Auth Pages
 * Left column with value props and social proof
 * Ledger-style design
 */

import Image from "next/image";
import Link from "next/link";
import { Zap, BarChart3, CheckCircle } from "lucide-react";

const valueProps = [
  {
    icon: Zap,
    text: "500+ Texas lenders trust us",
  },
  {
    icon: BarChart3,
    text: "5-minute AI reports",
  },
  {
    icon: CheckCircle,
    text: "95%+ accuracy rate",
  },
];

export function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center h-full p-12 xl:p-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(163, 230, 53, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(163, 230, 53, 0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-10">
          <Image
            src="/truplat.svg"
            alt="TruPlat"
            width={140}
            height={42}
            priority
          />
        </Link>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 clip-notch-sm border border-lime-400/30 mb-6">
          <span className="w-1.5 h-1.5 bg-lime-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
            Now Live in Texas
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-6">
          <span className="text-white">Property Values</span>
          <br />
          <span className="text-lime-400">in Minutes, Not Weeks</span>
        </h1>

        {/* Divider */}
        <div className="w-16 h-px bg-lime-400/50 mb-8" />

        {/* Value Props */}
        <ul className="space-y-4">
          {valueProps.map((prop) => (
            <li key={prop.text} className="flex items-center gap-3">
              <div className="w-8 h-8 clip-notch-sm bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
                <prop.icon className="w-4 h-4 text-lime-400" />
              </div>
              <span className="text-gray-300 text-sm">{prop.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}

export default BrandPanel;
