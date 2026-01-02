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
    <section className="py-20 bg-gray-950/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            Client Success Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            See what our clients say about transforming their appraisal workflow
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="relative overflow-hidden clip-notch-lg bg-gray-900 border border-gray-800 p-8 md:p-12">
            {/* L-bracket corners */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400 z-20" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-lime-400 z-20" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-lime-400 z-20" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400 z-20" />

            <Quote className="absolute top-6 left-6 w-12 h-12 text-lime-400/20" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.85, 0, 0.15, 1] }}
                className="relative z-10"
              >
                {/* Stars + Metric Badge */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonials[currentIndex].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-lime-400 text-lime-400"
                        />
                      ),
                    )}
                  </div>
                  <div className="px-4 py-2 clip-notch-sm bg-lime-500/10 border border-lime-500/30">
                    <span className="text-lg font-bold text-lime-400">
                      {testimonials[currentIndex].metric}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-gray-400 ml-2">
                      {testimonials[currentIndex].metricLabel}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                  &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </p>

                {/* Author + Company */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 clip-notch-sm bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-mono font-bold text-xl">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                  {/* Company Badge */}
                  <div className="flex items-center gap-3 px-4 py-2 clip-notch-sm bg-gray-800 border border-gray-700">
                    <div className="w-8 h-8 clip-notch-sm bg-gray-900 border border-gray-700 flex items-center justify-center">
                      <span className="font-mono text-xs font-bold text-lime-400">
                        {testimonials[currentIndex].companyInitials}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-gray-900 border border-gray-700 clip-notch-sm flex items-center justify-center text-white hover:border-lime-500/50 transition-all"
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-gray-900 border border-gray-700 clip-notch-sm flex items-center justify-center text-white hover:border-lime-500/50 transition-all"
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Diamond Dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 transition-all ${
                index === currentIndex
                  ? "bg-lime-400 scale-125"
                  : "bg-gray-700 hover:bg-gray-500"
              }`}
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
