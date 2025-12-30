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
    label: "Properties Analyzed",
  },
  {
    icon: Clock,
    value: 24,
    suffix: "hr",
    label: "Average Turnaround",
  },
  {
    icon: Target,
    value: 95,
    suffix: "%",
    label: "Accuracy Rate",
  },
  {
    icon: DollarSign,
    value: 2,
    suffix: "M+",
    prefix: "$",
    label: "Client Savings",
  },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
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
    stat.value >= 1000
      ? count.toLocaleString()
      : count.toString();

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="relative flex flex-col items-center p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <div className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-2">
          {stat.prefix}
          {formattedValue}
          {stat.suffix}
        </div>
        <div className="text-[var(--muted-foreground)] text-sm text-center">
          {stat.label}
        </div>
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
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 relative">
      {/* Background accent */}
      <div
        className="absolute inset-0 bg-[var(--gradient-glow)] opacity-50"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Trusted by Leading Lenders
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
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
