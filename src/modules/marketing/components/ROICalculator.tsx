"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export function ROICalculator() {
  const [dealsPerMonth, setDealsPerMonth] = useState(15);
  const [currentCost, setCurrentCost] = useState(450);
  const [currentDays, setCurrentDays] = useState(14);

  // TruPlat pricing (average of AI Report + On-Site)
  const truplatAvgCost = 89; // Blended average
  const truplatDays = 2; // Average turnaround

  const savings = useMemo(() => {
    const monthlySavings = dealsPerMonth * (currentCost - truplatAvgCost);
    const annualSavings = monthlySavings * 12;
    const daysSaved = dealsPerMonth * (currentDays - truplatDays);
    const hoursSaved = daysSaved * 2; // Assume 2 hours of admin work per deal saved
    const additionalDeals = Math.floor(daysSaved / currentDays); // Extra deals possible

    return {
      monthly: monthlySavings,
      annual: annualSavings,
      hours: hoursSaved,
      additionalDeals,
    };
  }, [dealsPerMonth, currentCost, currentDays]);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 clip-notch-sm bg-lime-500/10 border border-lime-500/30 text-lime-400 font-mono text-xs uppercase tracking-wider mb-4">
            <Calculator className="w-4 h-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How Much Will You Save?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            See your potential savings with TruPlat vs traditional appraisals
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-gray-900 clip-notch-lg border border-gray-800 p-8"
          >
            {/* L-bracket corners */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400" />

            <h3 className="text-lg font-semibold text-white mb-6">
              Your Current Situation
            </h3>

            {/* Deals per month */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs uppercase tracking-wider text-gray-400">
                  Deals per month
                </label>
                <span className="text-2xl font-bold text-lime-400">
                  {dealsPerMonth}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={dealsPerMonth}
                onChange={(e) => setDealsPerMonth(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-lime-400"
              />
              <div className="flex justify-between font-mono text-xs text-gray-600 mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            {/* Current appraisal cost */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs uppercase tracking-wider text-gray-400">
                  Current cost per appraisal
                </label>
                <span className="text-2xl font-bold text-lime-400">
                  ${currentCost}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="50"
                value={currentCost}
                onChange={(e) => setCurrentCost(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-lime-400"
              />
              <div className="flex justify-between font-mono text-xs text-gray-600 mt-1">
                <span>$200</span>
                <span>$800</span>
              </div>
            </div>

            {/* Current turnaround */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs uppercase tracking-wider text-gray-400">
                  Current turnaround (days)
                </label>
                <span className="text-2xl font-bold text-lime-400">
                  {currentDays}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="21"
                value={currentDays}
                onChange={(e) => setCurrentDays(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-lime-400"
              />
              <div className="flex justify-between font-mono text-xs text-gray-600 mt-1">
                <span>3 days</span>
                <span>21 days</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative bg-gradient-to-br from-lime-500/10 to-lime-500/5 clip-notch-lg border border-lime-500/20 p-8"
          >
            {/* L-bracket corners */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-lime-400" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-lime-400" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400" />

            <h3 className="text-lg font-semibold text-white mb-6">
              Your Savings with TruPlat
            </h3>

            <div className="space-y-6">
              {/* Monthly savings */}
              <div className="bg-gray-900 clip-notch p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 clip-notch-sm bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                      Monthly Savings
                    </p>
                    <motion.p
                      key={savings.monthly}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-lime-400"
                    >
                      ${savings.monthly.toLocaleString()}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Annual savings */}
              <div className="bg-gray-900 clip-notch p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 clip-notch-sm bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                      Annual Savings
                    </p>
                    <motion.p
                      key={savings.annual}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-white"
                    >
                      ${savings.annual.toLocaleString()}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Hours saved */}
              <div className="bg-gray-900 clip-notch p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 clip-notch-sm bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                      Hours Saved Monthly
                    </p>
                    <motion.p
                      key={savings.hours}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-white"
                    >
                      {savings.hours}+ hrs
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Additional deals */}
              {savings.additionalDeals > 0 && (
                <div className="text-center p-4 bg-lime-500/5 clip-notch border border-lime-500/20">
                  <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                    With faster turnaround, you could close
                  </p>
                  <p className="text-xl font-bold text-lime-400">
                    {savings.additionalDeals}+ additional deals/month
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/register">
            <Button
              variant="lime"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start Saving Today
            </Button>
          </Link>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-gray-500">
            No credit card required. Start with 3 free AI reports.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
