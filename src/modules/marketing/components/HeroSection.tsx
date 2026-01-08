"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-black"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/8 via-transparent to-transparent" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
          >
            <span className="text-white">Property intel</span>
            <br />
            <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
              before anyone else
            </span>
          </motion.h1>

          {/* Single line subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 text-xl text-gray-400 max-w-xl mx-auto"
          >
            AI valuations with infrastructure signals no one else sees.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10"
          >
            <Link href="/register">
              <button className="group px-8 py-4 bg-lime-400 text-black font-semibold rounded-full transition-all hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] hover:scale-105">
                <span className="flex items-center gap-2">
                  Try Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </motion.div>

          {/* Minimal stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 flex justify-center gap-12 text-sm text-gray-500"
          >
            <span>254 Texas counties</span>
            <span>50+ data sources</span>
            <span>Updated daily</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
