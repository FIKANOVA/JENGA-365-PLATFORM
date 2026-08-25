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
import type { IntakeFormData } from "@/lib/intake/types"

export async function submitDiagnosticIntake(formData: IntakeFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return { success: false, error: "Unauthorised" }
  }

  const userId = session.user.id
  const score = computeResilienceScore(formData.q1, formData.q2)

  // Embedding generation is OUTSIDE the transaction: it's an external API call
  // that should not hold a DB connection. Failure must not roll back the intake.
  let embedding: number[] | null = null
  try {
    const embeddingText = buildEmbeddingText(formData)
    embedding = await generateProfileEmbedding(embeddingText)
  } catch {
    // Embedding API failure: intake data is preserved; embeddingStale=true
    // signals Amani should regenerate on next dashboard visit.
  }

  // Atomic: intake row + resilience baseline + intakeCompleted flip ship together
  // or not at all. Prevents a dashboard-accessible mentee with no baseline.
  await db.transaction(async (tx) => {
    await tx.insert(menteeIntake).values({
      userId,
      academicStanding: formData.academicStanding,
      careerTags: formData.careerTags,
      careerFreeText: formData.careerFreeText || null,
      supportTypes: formData.supportTypes,
      preferredMentorshipStyle: formData.preferredMentorshipStyle,
    })

    await tx.insert(resilienceAssessments).values({
      userId,
      score,
      q1Response: formData.q1,
      q2Response: formData.q2,
      identityResponse: null,
      isBaseline: true,
      reassessmentDueDate: addMonths(new Date(), 6),
    })

    // Seed normalized goal-alignment tags from the mentee's career interests.
    // Drives the 10% goal-alignment term in matching (CLAUDE.md §4 / §10.2).
    if (formData.careerTags.length > 0) {
      await tx
        .insert(userGoalTags)
        .values(formData.careerTags.map((category) => ({ userId, category })))
        .onConflictDoNothing()
    }

    await tx
      .update(users)
      .set({
        intakeCompleted: true,
        onboarded: true,
        ...(embedding !== null ? { embedding, embeddingStale: false } : { embeddingStale: true }),
      } as any)
      .where(eq(users.id, userId))
  })

  redirect("/dashboard")
}
