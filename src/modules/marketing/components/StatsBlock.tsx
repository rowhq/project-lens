"use client";

import { useEffect, useState, useRef } from "react";
import { Building2, Clock, Target, DollarSign } from "lucide-react";

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const stats: Stat[] = [
  {
    icon: Building2,
    value: 50000,
    suffix: "+",
    label: "Properties Valued",
  },
  {
    icon: Clock,
    value: 24,
    suffix: "hr",
    label: "Avg. Delivery Time",
  },
  {
    icon: Target,
    value: 95,
    suffix: "%",
    label: "Within 5% of Sale Price",
  },
  {
    icon: DollarSign,
    value: 2,
    suffix: "M+",
    prefix: "$",
    label: "Saved by Clients",
  },
];

function useCountUp(
  end: number,
  duration: number = 2000,
  start: boolean = false,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

function StatCard({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
  const count = useCountUp(stat.value, 2000, isVisible);
  const Icon = stat.icon;

  const formattedValue =
    stat.value >= 1000 ? count.toLocaleString() : count.toString();

  return (
    <div
      className="group relative flex flex-col items-center p-8 clip-notch bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] hover:shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.5)] transition-all"
      style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
    >
      {/* L-bracket corners */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="w-12 h-12 clip-notch-sm bg-lime-500/10 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-lime-400" />
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {stat.prefix}
        {formattedValue}
        {stat.suffix}
      </div>
      <div className="font-mono text-xs uppercase tracking-wider text-gray-500 text-center">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsBlock() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 grid-pattern opacity-30"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            Platform Metrics
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by Leading Lenders
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our AI-powered platform delivers consistent, accurate valuations at
            unprecedented speed.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBlock;
