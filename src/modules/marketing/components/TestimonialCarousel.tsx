"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "VP of Lending",
    company: "Texas Home Loans",
    companyInitials: "THL",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
    quote:
      "TruPlat has transformed our underwriting process. What used to take 2-3 weeks now happens in 24 hours. The AI accuracy is remarkable.",
    metric: "85% faster turnaround",
    metricLabel: "Time Saved",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Portfolio Manager",
    company: "Lone Star Investments",
    companyInitials: "LSI",
    avatar: "/avatars/michael.jpg",
    rating: 5,
    quote:
      "The depth of market analysis in each report is incredible. We've been able to make faster, more confident investment decisions.",
    metric: "3x more deals",
    metricLabel: "Deal Volume",
  },
  {
    id: 3,
    name: "Jennifer Rodriguez",
    role: "Chief Risk Officer",
    company: "Hill Country Bank",
    companyInitials: "HCB",
    avatar: "/avatars/jennifer.jpg",
    rating: 5,
    quote:
      "Risk assessment used to be our bottleneck. TruPlat identifies potential issues we might have missed, saving us from costly mistakes.",
    metric: "$250K saved",
    metricLabel: "Risk Prevented",
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Real Estate Director",
    company: "Austin Capital Partners",
    companyInitials: "ACP",
    avatar: "/avatars/david.jpg",
    rating: 5,
    quote:
      "The DD Marketplace feature is genius. We've recouped costs by reselling reports and discovered properties from purchased reports.",
    metric: "67% cost reduction",
    metricLabel: "Net Savings",
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 bg-[var(--secondary)]/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            See what our clients say about transforming their appraisal workflow
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 md:p-12">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-[var(--primary)]/20" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                {/* Stars + Metric Badge */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonials[currentIndex].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-500 text-yellow-500"
                        />
                      ),
                    )}
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <span className="text-lg font-bold text-[var(--primary)]">
                      {testimonials[currentIndex].metric}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)] ml-2">
                      {testimonials[currentIndex].metricLabel}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-[var(--foreground)] font-medium leading-relaxed mb-8">
                  &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </p>

                {/* Author + Company */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                  {/* Company Badge */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-md bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--primary)]">
                        {testimonials[currentIndex].companyInitials}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {testimonials[currentIndex].company}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-[var(--card)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-[var(--card)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-[var(--primary)]"
                  : "bg-[var(--muted)] hover:bg-[var(--muted-foreground)]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
