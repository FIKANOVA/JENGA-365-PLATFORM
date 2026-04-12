"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { addMonths } from "date-fns"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { menteeIntake, resilienceAssessments, users } from "@/lib/db/schema"
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

  // 1. Save intake record (UNIQUE on user_id prevents double-submit at DB level)
  await db.insert(menteeIntake).values({
    userId,
    academicStanding: formData.academicStanding,
    careerTags: formData.careerTags,
    careerFreeText: formData.careerFreeText || null,
    supportTypes: formData.supportTypes,
    preferredMentorshipStyle: formData.preferredMentorshipStyle,
  })

  // 2. Save resilience baseline
  await db.insert(resilienceAssessments).values({
    userId,
    score,
    q1Response: formData.q1,
    q2Response: formData.q2,
    identityResponse: null,           // NULL on baseline — not yet asked
    isBaseline: true,
    reassessmentDueDate: addMonths(new Date(), 6),
  })

  // 3. Generate embedding — graceful fallback if API fails
  let embedding: number[] | null = null
  let embeddingStale = false

  try {
    const embeddingText = buildEmbeddingText(formData)
    embedding = await generateProfileEmbedding(embeddingText)
  } catch {
    // Embedding API failure: intake data is preserved.
    // embeddingStale=true signals Amani should regenerate on next dashboard visit.
    embeddingStale = true
  }

  // 4. Flip intake_completed flag (always, even if embedding failed)
  await db
    .update(users)
    .set({
      intakeCompleted: true,
      ...(embedding !== null ? { embedding, embeddingStale: false } : { embeddingStale: true }),
    } as any)
    .where(eq(users.id, userId))

  redirect("/dashboard")
}
