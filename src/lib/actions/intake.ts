"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { addMonths } from "date-fns"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { menteeIntake, resilienceAssessments, userGoalTags, users } from "@/lib/db/schema"
import { auth } from "@/lib/auth/config"
import { computeResilienceScore } from "@/lib/intake/scoring"
import { buildEmbeddingText } from "@/lib/intake/embedding"
import { generateProfileEmbedding } from "@/lib/ai/embeddings"
import type { IntakeFormData, CareerTag, SupportType, MentorshipStyle } from "@/lib/intake/types"

export async function submitDiagnosticIntake(formData: IntakeFormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return { success: false, error: "Unauthorised" }
    }

    const userId = session.user.id

    // Validate and sanitize data to satisfy Postgres constraints
    const safeQ1 = formData.q1 || "Sometimes"
    const safeQ2 = formData.q2 || "Managing"
    const rawScore = computeResilienceScore(safeQ1, safeQ2)
    const score = Math.max(1, Math.min(10, isNaN(rawScore) ? 5 : rawScore))

    const safeAcademicStanding = ["Good", "Probation", "Honors"].includes(formData.academicStanding)
      ? formData.academicStanding
      : "Good"

    const safeCareerTags: CareerTag[] = (formData.careerTags && formData.careerTags.length > 0)
      ? formData.careerTags.slice(0, 3)
      : (["Software Engineering"] as CareerTag[])

    const safeCareerFreeText = formData.careerFreeText
      ? formData.careerFreeText.slice(0, 280)
      : null

    const safeSupportTypes: SupportType[] = (formData.supportTypes && formData.supportTypes.length > 0)
      ? formData.supportTypes.slice(0, 2)
      : (["Career Guidance"] as SupportType[])

    const safeMentorshipStyle: MentorshipStyle = ["Strict", "Supportive", "Mixed"].includes(formData.preferredMentorshipStyle as MentorshipStyle)
      ? (formData.preferredMentorshipStyle as MentorshipStyle)
      : "Mixed"

    // Embedding generation is OUTSIDE the transaction: it's an external API call
    // that should not hold a DB connection. Failure must not roll back the intake.
    let embedding: number[] | null = null
    try {
      const embeddingText = buildEmbeddingText({
        ...formData,
        academicStanding: safeAcademicStanding,
        careerTags: safeCareerTags,
        careerFreeText: safeCareerFreeText || "",
        supportTypes: safeSupportTypes,
        preferredMentorshipStyle: safeMentorshipStyle,
        q1: safeQ1,
        q2: safeQ2,
      })
      embedding = await generateProfileEmbedding(embeddingText)
    } catch {
      // Embedding API failure: intake data is preserved; embeddingStale=true
      // signals Jenga AI should regenerate on next dashboard visit.
    }

    // Atomic: intake row + resilience baseline + intakeCompleted flip ship together
    await db.transaction(async (tx) => {
      await tx
        .insert(menteeIntake)
        .values({
          userId,
          academicStanding: safeAcademicStanding,
          careerTags: safeCareerTags,
          careerFreeText: safeCareerFreeText,
          supportTypes: safeSupportTypes,
          preferredMentorshipStyle: safeMentorshipStyle,
        })
        .onConflictDoUpdate({
          target: menteeIntake.userId,
          set: {
            academicStanding: safeAcademicStanding,
            careerTags: safeCareerTags,
            careerFreeText: safeCareerFreeText,
            supportTypes: safeSupportTypes,
            preferredMentorshipStyle: safeMentorshipStyle,
          },
        })

      await tx.insert(resilienceAssessments).values({
        userId,
        score,
        q1Response: safeQ1,
        q2Response: safeQ2,
        identityResponse: null,
        isBaseline: true,
        reassessmentDueDate: addMonths(new Date(), 6),
      })

      // Seed normalized goal-alignment tags from the mentee's career interests.
      // Drives the 10% goal-alignment term in matching (CLAUDE.md §4 / §10.2).
      if (safeCareerTags.length > 0) {
        await tx
          .insert(userGoalTags)
          .values(safeCareerTags.map((category) => ({ userId, category })))
          .onConflictDoNothing()
      }

      await tx
        .update(users)
        .set({
          intakeCompleted: true,
          onboarded: true,
          embeddingStale: embedding === null,
        } as any)
        .where(eq(users.id, userId))
    })

    // If embedding was generated, save it in a safe secondary update so vector quirks never abort intake
    if (embedding !== null) {
      await db
        .update(users)
        .set({ embedding, embeddingStale: false } as any)
        .where(eq(users.id, userId))
        .catch((err) => {
          console.warn("[intake] Embedding update skipped:", err)
        })
    }

    return { success: true, redirectTo: "/dashboard/mentee" }
  } catch (error) {
    console.error("[intake] submitDiagnosticIntake error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete profile. Please try again.",
    }
  }
}
