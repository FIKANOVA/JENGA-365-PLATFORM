import type { Q1Response, Q2Response } from './types'

const Q1_POINTS: Record<Q1Response, number> = {
  'Never':     1,
  'Rarely':    3,
  'Sometimes': 5,
  'Often':     8,
  'Always':    10,
}

const Q2_POINTS: Record<Q2Response, number> = {
  'Barely coping': 1,
  'Struggling':    4,
  'Managing':      7,
  'Thriving':      10,
}

/**
 * Computes a hidden resilience score (1–10) from two question responses.
 * The score is never shown to the mentee — it is stored as a MEAL baseline
 * and compared against 6-month re-assessments to calculate the Resilience Delta.
 */
export function computeResilienceScore(q1: Q1Response, q2: Q2Response): number {
  const raw = (Q1_POINTS[q1] + Q2_POINTS[q2]) / 2
  return Math.round(raw)
}
