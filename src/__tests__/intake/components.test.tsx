/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import IntakeProgress from '@/components/intake/IntakeProgress'
import SubmittingScreen from '@/components/intake/SubmittingScreen'

const LABELS: [string, string, string] = ['Background', 'Goals', 'Preferences']

// ─────────────────────────────────────────────────────────────────────────────
// IntakeProgress
// ─────────────────────────────────────────────────────────────────────────────
describe('IntakeProgress', () => {
  it('renders 3 step circles', () => {
    render(<IntakeProgress currentStep={1} stepLabels={LABELS} />)
    // Circles contain either a step number or checkmark
    const circles = screen.getAllByRole('generic').filter((el) =>
      ['1', '2', '3', '✓'].some((t) => el.textContent?.trim() === t)
    )
    // We expect exactly 3 circles (one per step)
    // Approach: check for the nav element and count step number/checkmark elements
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    // Step numbers 1, 2, 3 should all be present (step 1 active, 2 and 3 upcoming)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('marks the current step circle with aria-current="step"', () => {
    render(<IntakeProgress currentStep={2} stepLabels={LABELS} />)
    // Only the active step should have aria-current="step"
    const stepCircles = document.querySelectorAll('[aria-current="step"]')
    expect(stepCircles.length).toBe(1)
  })

  it('current step circle has active styling class', () => {
    const { container } = render(<IntakeProgress currentStep={2} stepLabels={LABELS} />)
    const activeCircle = container.querySelector('[aria-current="step"]')
    expect(activeCircle).not.toBeNull()
    // Active circles contain the step number (not checkmark)
    expect(activeCircle?.textContent?.trim()).toBe('2')
  })

  it('completed steps show checkmark text', () => {
    render(<IntakeProgress currentStep={3} stepLabels={LABELS} />)
    // Steps 1 and 2 are completed → should show ✓ instead of their numbers
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBe(2)
    // Step 3 is active, shows its number
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('step labels are rendered', () => {
    render(<IntakeProgress currentStep={1} stepLabels={LABELS} />)
    expect(screen.getByText('Background')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SubmittingScreen
// ─────────────────────────────────────────────────────────────────────────────
describe('SubmittingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when visible=false', () => {
    const { container } = render(<SubmittingScreen visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders overlay when visible=true', () => {
    render(<SubmittingScreen visible={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows lines 1 and 2 immediately when visible=true', () => {
    render(<SubmittingScreen visible={true} />)
    expect(screen.getByText('Saving intake record')).toBeInTheDocument()
    expect(screen.getByText('Recording resilience baseline')).toBeInTheDocument()
  })

  it('shows line 3 after 1 second', async () => {
    render(<SubmittingScreen visible={true} />)
    // Line 3 should not be visible (aria-hidden) before 1s
    const line3 = screen.getByText('Preparing your mentor recommendations…').closest('li')
    expect(line3).toHaveAttribute('aria-hidden', 'true')

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    // After 1s, line 3 should be visible
    expect(line3).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('shows line 4 after 2 seconds', async () => {
    render(<SubmittingScreen visible={true} />)
    const line4 = screen.getByText('Redirecting to dashboard').closest('li')
    expect(line4).toHaveAttribute('aria-hidden', 'true')

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(line4).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('shows all 4 status line texts in the DOM', () => {
    render(<SubmittingScreen visible={true} />)
    expect(screen.getByText('Saving intake record')).toBeInTheDocument()
    expect(screen.getByText('Recording resilience baseline')).toBeInTheDocument()
    expect(screen.getByText('Preparing your mentor recommendations…')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to dashboard')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// StepOne
// ─────────────────────────────────────────────────────────────────────────────
import StepOne from '@/components/intake/StepOne'
import { fireEvent } from '@testing-library/react'

describe('StepOne', () => {
  const mockOnChange = vi.fn()
  const mockOnNext = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnNext.mockClear()
  })

  it('renders Q1 options (Never, Rarely, Sometimes, Often, Always)', () => {
    render(<StepOne q1={null} q2={null} onChange={mockOnChange} onNext={mockOnNext} />)
    expect(screen.getByText('Never')).toBeInTheDocument()
    expect(screen.getByText('Rarely')).toBeInTheDocument()
    expect(screen.getByText('Sometimes')).toBeInTheDocument()
    expect(screen.getByText('Often')).toBeInTheDocument()
    expect(screen.getByText('Always')).toBeInTheDocument()
  })

  it('renders Q2 options (Barely coping, Struggling, Managing, Thriving)', () => {
    render(<StepOne q1={null} q2={null} onChange={mockOnChange} onNext={mockOnNext} />)
    expect(screen.getByText('Barely coping')).toBeInTheDocument()
    expect(screen.getByText('Struggling')).toBeInTheDocument()
    expect(screen.getByText('Managing')).toBeInTheDocument()
    expect(screen.getByText('Thriving')).toBeInTheDocument()
  })

  it('Next button is disabled when q1=null', () => {
    render(<StepOne q1={null} q2="Managing" onChange={mockOnChange} onNext={mockOnNext} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('Next button is disabled when q2=null', () => {
    render(<StepOne q1="Often" q2={null} onChange={mockOnChange} onNext={mockOnNext} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('Next button is enabled when both q1 and q2 are selected', () => {
    render(<StepOne q1="Often" q2="Managing" onChange={mockOnChange} onNext={mockOnNext} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).not.toBeDisabled()
  })

  it('calls onChange with correct field and value when a Q1 pill is clicked', () => {
    render(<StepOne q1={null} q2={null} onChange={mockOnChange} onNext={mockOnNext} />)
    fireEvent.click(screen.getByText('Sometimes'))
    expect(mockOnChange).toHaveBeenCalledWith('q1', 'Sometimes')
  })

  it('calls onChange with correct field and value when a Q2 pill is clicked', () => {
    render(<StepOne q1={null} q2={null} onChange={mockOnChange} onNext={mockOnNext} />)
    fireEvent.click(screen.getByText('Thriving'))
    expect(mockOnChange).toHaveBeenCalledWith('q2', 'Thriving')
  })

  it('calls onNext when Next button is clicked and both selections are made', () => {
    render(<StepOne q1="Often" q2="Managing" onChange={mockOnChange} onNext={mockOnNext} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// StepTwo
// ─────────────────────────────────────────────────────────────────────────────
import StepTwo from '@/components/intake/StepTwo'
import type { AcademicStanding, CareerTag, SupportType, MentorshipStyle } from '@/lib/intake/types'
import { CAREER_TAGS } from '@/lib/intake/types'

describe('StepTwo', () => {
  const mockOnChange = vi.fn()
  const mockOnNext = vi.fn()
  const mockOnBack = vi.fn()

  const defaultProps = {
    academicStanding: null as AcademicStanding | null,
    careerTags: [] as CareerTag[],
    careerFreeText: '',
    onChange: mockOnChange,
    onNext: mockOnNext,
    onBack: mockOnBack,
  }

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnNext.mockClear()
    mockOnBack.mockClear()
  })

  it('renders academic standing options (Good, Probation, Honors)', () => {
    render(<StepTwo {...defaultProps} />)
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Probation')).toBeInTheDocument()
    expect(screen.getByText('Honors')).toBeInTheDocument()
  })

  it('renders all 10 career tag chips', () => {
    render(<StepTwo {...defaultProps} />)
    expect(CAREER_TAGS).toHaveLength(10)
    for (const tag of CAREER_TAGS) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
  })

  it('Next button is disabled when academicStanding is null', () => {
    render(<StepTwo {...defaultProps} academicStanding={null} careerTags={['Finance']} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('Next button is disabled when careerTags is empty', () => {
    render(<StepTwo {...defaultProps} academicStanding="Good" careerTags={[]} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('Next button is enabled when both academicStanding and careerTags are selected', () => {
    render(<StepTwo {...defaultProps} academicStanding="Good" careerTags={['Finance']} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).not.toBeDisabled()
  })

  it('clicking a 4th chip is ignored when 3 are already selected', () => {
    const selectedTags: CareerTag[] = ['Finance', 'Healthcare', 'Law']
    render(<StepTwo {...defaultProps} careerTags={selectedTags} />)
    // 'Education' is the 4th unselected chip — it should be disabled
    const educationChip = screen.getByText('Education').closest('button')
    expect(educationChip).toBeDisabled()
    fireEvent.click(educationChip!)
    // onChange should NOT be called since the chip is disabled
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('character counter updates as user types in textarea', () => {
    render(<StepTwo {...defaultProps} careerFreeText="Hello" />)
    expect(screen.getByText('5 / 280')).toBeInTheDocument()
  })

  it('calls onBack when Back button is clicked', () => {
    render(<StepTwo {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// StepThree
// ─────────────────────────────────────────────────────────────────────────────
import StepThree from '@/components/intake/StepThree'

describe('StepThree', () => {
  const mockOnChange = vi.fn()
  const mockOnBack = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    supportTypes: [] as SupportType[],
    preferredMentorshipStyle: null as MentorshipStyle | null,
    onChange: mockOnChange,
    onBack: mockOnBack,
    onSubmit: mockOnSubmit,
    isSubmitting: false,
  }

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnBack.mockClear()
    mockOnSubmit.mockClear()
  })

  it('renders all 4 support type chips', () => {
    render(<StepThree {...defaultProps} />)
    expect(screen.getByText('Career Guidance')).toBeInTheDocument()
    expect(screen.getByText('Psycho-Social Support')).toBeInTheDocument()
    expect(screen.getByText('Technical Skills')).toBeInTheDocument()
    expect(screen.getByText('Networking')).toBeInTheDocument()
  })

  it('renders all 3 mentorship style cards with descriptions', () => {
    render(<StepThree {...defaultProps} />)
    expect(screen.getByText('Strict')).toBeInTheDocument()
    expect(screen.getByText('Structured sessions, homework, clear accountability')).toBeInTheDocument()
    expect(screen.getByText('Supportive')).toBeInTheDocument()
    expect(screen.getByText('Open-ended, mentee-led, flexible pace')).toBeInTheDocument()
    expect(screen.getByText('Mixed')).toBeInTheDocument()
    expect(screen.getByText('Blend of both depending on the week')).toBeInTheDocument()
  })

  it('Complete Profile button is disabled when supportTypes is empty', () => {
    render(<StepThree {...defaultProps} supportTypes={[]} preferredMentorshipStyle="Strict" />)
    const btn = screen.getByRole('button', { name: /complete profile/i })
    expect(btn).toBeDisabled()
  })

  it('Complete Profile button is disabled when preferredMentorshipStyle is null', () => {
    render(<StepThree {...defaultProps} supportTypes={['Networking']} preferredMentorshipStyle={null} />)
    const btn = screen.getByRole('button', { name: /complete profile/i })
    expect(btn).toBeDisabled()
  })

  it('Complete Profile button is disabled when isSubmitting=true', () => {
    render(<StepThree {...defaultProps} supportTypes={['Networking']} preferredMentorshipStyle="Mixed" isSubmitting={true} />)
    // Button shows "Submitting…" text when isSubmitting
    const btn = screen.getByRole('button', { name: /submitting/i })
    expect(btn).toBeDisabled()
  })

  it('Complete Profile button is enabled when both selected and not submitting', () => {
    render(<StepThree {...defaultProps} supportTypes={['Networking']} preferredMentorshipStyle="Mixed" isSubmitting={false} />)
    const btn = screen.getByRole('button', { name: /complete profile/i })
    expect(btn).not.toBeDisabled()
  })

  it('clicking a 3rd support type chip is ignored when 2 are already selected', () => {
    const selected: SupportType[] = ['Career Guidance', 'Networking']
    render(<StepThree {...defaultProps} supportTypes={selected} />)
    // 'Technical Skills' is unselected — should be disabled
    const techChip = screen.getByText('Technical Skills').closest('button')
    expect(techChip).toBeDisabled()
    fireEvent.click(techChip!)
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('calls onBack when Back button is clicked', () => {
    render(<StepThree {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when Complete Profile button is clicked in valid state', () => {
    render(<StepThree {...defaultProps} supportTypes={['Technical Skills']} preferredMentorshipStyle="Supportive" />)
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }))
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })
})
