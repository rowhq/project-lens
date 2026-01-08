"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400/10 via-transparent to-transparent" />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Start free today
          </h2>
          <p className="text-gray-400 mb-8">5 reports/month. No credit card.</p>
          <Link href="/register">
            <button className="group px-8 py-4 bg-lime-400 text-black font-semibold rounded-full hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] transition-all">
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
