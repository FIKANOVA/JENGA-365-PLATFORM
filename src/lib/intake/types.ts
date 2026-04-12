export type Q1Response = 'Never' | 'Rarely' | 'Sometimes' | 'Often' | 'Always'
export type Q2Response = 'Barely coping' | 'Struggling' | 'Managing' | 'Thriving'
export type AcademicStanding = 'Good' | 'Probation' | 'Honors'
export type SupportType = 'Career Guidance' | 'Psycho-Social Support' | 'Technical Skills' | 'Networking'
export type MentorshipStyle = 'Strict' | 'Supportive' | 'Mixed'

export const CAREER_TAGS = [
  'Software Engineering',
  'Finance',
  'Healthcare',
  'Design / Creative',
  'Law',
  'Social Impact / NGO',
  'Product Management',
  'Agri-tech',
  'Education',
  'Other',
] as const

export type CareerTag = typeof CAREER_TAGS[number]

export interface IntakeFormData {
  q1: Q1Response
  q2: Q2Response
  academicStanding: AcademicStanding
  careerTags: CareerTag[]
  careerFreeText: string
  supportTypes: SupportType[]
  preferredMentorshipStyle: MentorshipStyle
}
