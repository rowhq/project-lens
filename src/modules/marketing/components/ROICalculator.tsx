"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Clock, TrendingUp } from "lucide-react";

export function ROICalculator() {
  const [dealsPerMonth, setDealsPerMonth] = useState(15);
  const [currentCost, setCurrentCost] = useState(450);
  const [currentDays, setCurrentDays] = useState(14);

  // LENS pricing (average of AI Report + On-Site)
  const lensAvgCost = 89; // Blended average
  const lensDays = 2; // Average turnaround

  const savings = useMemo(() => {
    const monthlySavings = dealsPerMonth * (currentCost - lensAvgCost);
    const annualSavings = monthlySavings * 12;
    const daysSaved = dealsPerMonth * (currentDays - lensDays);
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
      <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            How Much Will You Save?
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            See your potential savings with LENS vs traditional appraisals
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8"
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
              Your Current Situation
            </h3>

            {/* Deals per month */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Deals per month
                </label>
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {dealsPerMonth}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={dealsPerMonth}
                onChange={(e) => setDealsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            {/* Current appraisal cost */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Current cost per appraisal
                </label>
                <span className="text-2xl font-bold text-[var(--primary)]">
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
                className="w-full h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                <span>$200</span>
                <span>$800</span>
              </div>
            </div>

            {/* Current turnaround */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Current turnaround (days)
                </label>
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {currentDays}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="21"
                value={currentDays}
                onChange={(e) => setCurrentDays(Number(e.target.value))}
                className="w-full h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
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
            className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-2xl border border-[var(--primary)]/20 p-8"
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
              Your Savings with LENS
            </h3>

            <div className="space-y-6">
              {/* Monthly savings */}
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Monthly Savings
                    </p>
                    <motion.p
                      key={savings.monthly}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-green-400"
                    >
                      ${savings.monthly.toLocaleString()}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Annual savings */}
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Annual Savings
                    </p>
                    <motion.p
                      key={savings.annual}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-[var(--primary)]"
                    >
                      ${savings.annual.toLocaleString()}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Hours saved */}
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Hours Saved Monthly
                    </p>
                    <motion.p
                      key={savings.hours}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-purple-400"
                    >
                      {savings.hours}+ hrs
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Additional deals */}
              {savings.additionalDeals > 0 && (
                <div className="text-center p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    With faster turnaround, you could close
                  </p>
                  <p className="text-xl font-bold text-[var(--primary)]">
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
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent)] transition-colors text-lg"
          >
            Start Saving Today
            <TrendingUp className="w-5 h-5" />
          </a>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            No credit card required. Start with 3 free AI reports.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
