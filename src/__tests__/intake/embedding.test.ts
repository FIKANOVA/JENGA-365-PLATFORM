import { describe, it, expect } from 'vitest'
import { buildEmbeddingText } from '@/lib/intake/embedding'
import type { IntakeFormData } from '@/lib/intake/types'

const baseData: IntakeFormData = {
  q1: 'Sometimes',
  q2: 'Managing',
  academicStanding: 'Good',
  careerTags: ['Software Engineering', 'Product Management'],
  careerFreeText: '',
  supportTypes: ['Career Guidance', 'Technical Skills'],
  preferredMentorshipStyle: 'Strict',
}

describe('buildEmbeddingText', () => {
  it('includes all career tags joined by comma', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Software Engineering, Product Management')
  })

  it('includes support types', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Career Guidance, Technical Skills')
  })

  it('includes mentorship style', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Strict')
  })

  it('includes academic standing', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Good')
  })

  it('includes career free text when provided', () => {
    const data = { ...baseData, careerFreeText: 'I want to build fintech products.' }
    const text = buildEmbeddingText(data)
    expect(text).toContain('I want to build fintech products.')
  })

  it('omits free text section when careerFreeText is empty', () => {
    const text = buildEmbeddingText({ ...baseData, careerFreeText: '' })
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('null')
  })

  it('returns a non-empty string', () => {
    const text = buildEmbeddingText(baseData)
    expect(text.trim().length).toBeGreaterThan(0)
  })
})
