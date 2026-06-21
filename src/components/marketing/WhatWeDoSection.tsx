"use client";

import Link from "next/link";
import { Brain, Leaf, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Dual-Engine section, Engine A (AI-driven mentorship) + Engine B
 * (Environmental Stewardship & Green Technology, corporate-ESG framing).
 *
 * Engine B copy is the verbatim corporate-friendly draft Moseti relayed on
 * 2026-05-22, Green Technology and measurable climate action.
 */
export default function WhatWeDoSection() {
  return (
    <section className="bg-[color:var(--surface-1)] min-h-[100svh] flex flex-col justify-center py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-10 md:mb-14"
        >
          <span
            className="text-eyebrow"
            style={{ color: "var(--brand-green)" }}
          >
            The Dual-Engine Model
          </span>
          <h2 className="mt-3 text-display-md text-foreground">Two engines. One platform.</h2>
          <p
            className="mt-5 text-body-lg"
            style={{ color: "var(--foreground-muted)" }}
          >
            We don&apos;t separate human development from environmental
            stewardship. Every athlete on Jenga365 is a mentee and a steward,
            earning their growth through verified climate action.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngineCard
            eyebrow="Engine A"
            title="AI-driven mentorship & resilience"
            icon={Brain}
            body="Our pgvector matching engine pairs each mentee with a mentor on six weighted signals: semantic profile similarity, location, availability, goal alignment, partner affiliation, and profile completeness. Every mentor is capped at two active mentees so attention isn't diluted."
            bullets={[
              "AI-matched 1:2 mentorship, never more than two mentees per mentor",
              "Quarterly resilience assessments with delta tracking",
              "Structured career, financial-literacy, and welfare pathways",
            ]}
            href="/mentors"
            ctaLabel="See the matching algorithm"
            delay={0.1}
          />

          <EngineCard
            eyebrow="Engine B"
            title="Environmental Stewardship & Green Technology"
            icon={Leaf}
            body="True impact extends beyond the pitch and into the soil. Through signature campaigns like Trees for Tries, we empower athletes, recognized as worthy stakeholders in our planet's future, to lead community clean-ups, advocate for sustainable waste management, and execute targeted ecosystem restoration."
            bullets={[
              "Quarterly Monitoring & Evaluation (M&E) with GPS-anchored evidence",
              "Tree-survival audits, we track survival, not just planting",
              "Transparent, verifiable ESG data for corporate sustainability reports",
            ]}
            href="/impact"
            ctaLabel="Become a Corporate Partner"
            accent
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function EngineCard({
  eyebrow,
  title,
  icon: Icon,
  body,
  bullets,
  href,
  ctaLabel,
  accent = false,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: string;
  bullets: string[];
  href: string;
  ctaLabel: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className={`group rounded-3xl border p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col ${
        accent ? "bg-brand-green-soft/30 border-brand-green/20" : "bg-background border-border"
      }`}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: accent ? "linear-gradient(to bottom right, rgba(46, 160, 67, 0.05), transparent)" : "linear-gradient(to bottom right, rgba(0,0,0,0.02), transparent)"
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm border border-black/5"
            style={{
              background: accent ? "var(--brand-green-soft)" : "var(--surface-2)",
              color: accent ? "var(--brand-green)" : "var(--foreground)",
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="pt-1">
            <span
              className="text-eyebrow tracking-widest"
              style={{
                color: accent ? "var(--brand-green)" : "var(--foreground-subtle)",
              }}
            >
              {eyebrow}
            </span>
            <h3 className="mt-1.5 text-title text-foreground tracking-tight">{title}</h3>
          </div>
        </div>

        <p className="text-body-sm text-foreground-muted leading-relaxed">
          {body}
        </p>

        <ul className="mt-6 space-y-3 mb-10">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-body-sm text-foreground"
            >
              <span
                className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 shadow-sm"
                style={{ background: accent ? "var(--brand-green)" : "var(--foreground)" }}
                aria-hidden
              />
              <span className="leading-snug opacity-90">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link
            href={href}
            className={`group/btn w-full sm:w-auto inline-flex max-w-full items-center justify-between gap-3 h-12 pl-5 sm:pl-6 pr-1.5 rounded-full font-medium text-white transition-all duration-300 hover:shadow-lg ${accent ? "hover:bg-brand-green-hover" : "bg-foreground hover:opacity-90"}`}
            style={accent ? { background: "var(--brand-green)" } : undefined}
          >
            <span className="truncate text-sm sm:text-base">{ctaLabel}</span>
            <span className="bg-white shrink-0 rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1">
               <ArrowRight className="h-4 w-4 text-black" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
