"use client";

import { useState, useEffect, useRef } from "react";
import { Quote } from "lucide-react";

// Testimonials with shorter, punchier quotes
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "VP of Lending",
    company: "Texas Home Loans",
    quote:
      "Turnaround dropped from 2 weeks to 24 hours. Game changer for our pipeline.",
    metric: "85%",
    metricLabel: "Faster",
  },
  {
    id: 2,
    name: "Michael C.",
    role: "Portfolio Manager",
    company: "Lone Star Investments",
    quote: "We close more deals because we can move faster with confidence.",
    metric: "3x",
    metricLabel: "More Deals",
  },
  {
    id: 3,
    name: "Jennifer R.",
    role: "Chief Risk Officer",
    company: "Hill Country Bank",
    quote:
      "Catches risks we would have missed. Already saved us from two bad deals.",
    metric: "$250K",
    metricLabel: "Saved",
  },
];

// Single Testimonial Card
function TestimonialCard({
  testimonial,
  isVisible,
  delay,
}: {
  testimonial: (typeof testimonials)[0];
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div
      className="group relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-6 clip-notch transition-all duration-500 hover:shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.5)]"
      style={{
        transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* L-bracket corners on hover */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Metric - Hero element */}
      <div className="mb-6">
        <div className="inline-flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-lime-400">
            {testimonial.metric}
          </span>
          <span className="font-mono text-sm uppercase tracking-wider text-gray-400">
            {testimonial.metricLabel}
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="relative mb-6">
        <Quote className="absolute -top-2 -left-1 w-6 h-6 text-lime-400/20" />
        <p className="text-white leading-relaxed pl-5">{testimonial.quote}</p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
        <div className="w-10 h-10 clip-notch-sm bg-lime-500/10 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)] flex items-center justify-center">
          <span className="font-mono text-sm font-bold text-lime-400">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium text-white text-sm">{testimonial.name}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
            {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialCarousel() {
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
    <section ref={ref} className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-950/50" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-12 transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            What Lenders Say
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Real Results from Real Clients
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isVisible={isVisible}
              delay={index * 150}
            />
          ))}
        </div>

        {/* Bottom social proof */}
        <div
          className="mt-12 text-center transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "600ms",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch-sm">
            <div className="flex -space-x-2">
              {["S", "M", "J", "D"].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {initial}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-6 w-px bg-gray-700" />
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400">
              <span className="text-lime-400 font-bold">500+</span> lenders
              trust TruPlat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;
