import type { IntakeFormData } from './types'

/**
 * Converts structured intake form data into a prose string for embedding generation.
 * Format mirrors what a mentor profile would contain, enabling cosine similarity matching.
 *
 * Example output:
 * "Career interests: Software Engineering, Product Management.
 *  I want to build fintech products for underserved communities.
 *  Seeking support in: Career Guidance, Technical Skills.
 *  Preferred mentorship style: Strict. Academic standing: Good."
 */
export function buildEmbeddingText(data: IntakeFormData): string {
  const parts: string[] = [
    `Career interests: ${data.careerTags.join(', ')}.`,
  ]

  if (data.careerFreeText && data.careerFreeText.trim().length > 0) {
    parts.push(data.careerFreeText.trim())
  }

  parts.push(`Seeking support in: ${data.supportTypes.join(', ')}.`)
  parts.push(`Preferred mentorship style: ${data.preferredMentorshipStyle}.`)
  parts.push(`Academic standing: ${data.academicStanding}.`)

  return parts.join(' ')
}
