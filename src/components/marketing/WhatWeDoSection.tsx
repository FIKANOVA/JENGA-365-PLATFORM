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
    <section className="bg-[color:var(--surface-1)] py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
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
      className="group rounded-2xl border bg-[color:var(--surface-2)] p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
      style={{ borderColor: accent ? "var(--brand-green-soft)" : "var(--surface-3)" }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: accent ? "linear-gradient(to bottom right, rgba(46, 160, 67, 0.05), transparent)" : "linear-gradient(to bottom right, rgba(255,255,255,0.03), transparent)"
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: accent ? "var(--brand-green-soft)" : "var(--surface-3)",
              color: accent ? "var(--brand-green)" : "var(--foreground)",
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <span
              className="text-eyebrow"
              style={{
                color: accent ? "var(--brand-green)" : "var(--foreground-muted)",
              }}
            >
              {eyebrow}
            </span>
            <h3 className="mt-1 text-headline text-foreground">{title}</h3>
          </div>
        </div>

        <p className="text-body text-foreground-muted">
          {body}
        </p>

        <ul className="mt-6 space-y-3 mb-8">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-body-sm text-foreground"
            >
              <span
                className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--brand-green)" }}
                aria-hidden
              />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link
            href={href}
            className="group/btn inline-flex items-center gap-2 h-11 px-5 rounded-lg text-label font-medium transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            style={{
              background: accent ? "var(--brand-green)" : "var(--foreground)",
              color: accent ? "white" : "var(--background)"
            }}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
