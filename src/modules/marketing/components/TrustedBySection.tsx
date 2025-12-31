"use client";

import { motion } from "framer-motion";

// Placeholder Texas-based lending companies
const clients = [
  { name: "Texas Capital Lending", initials: "TCL" },
  { name: "Lone Star Mortgage", initials: "LSM" },
  { name: "Austin Home Loans", initials: "AHL" },
  { name: "Houston Realty Finance", initials: "HRF" },
  { name: "Dallas Lending Group", initials: "DLG" },
  { name: "San Antonio Credit Union", initials: "SACU" },
];

export function TrustedBySection() {
  return (
    <section className="py-12 border-y border-[var(--border)] bg-[var(--card)]/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-8">
            Trusted by 500+ Texas Lenders & Investors
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group flex items-center justify-center"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center transition-all duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)]/5"
                  title={client.name}
                >
                  <span className="text-lg md:text-xl font-bold text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {client.initials}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-sm text-[var(--muted-foreground)]"
          >
            Join the fastest-growing network of real estate professionals in
            Texas
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
