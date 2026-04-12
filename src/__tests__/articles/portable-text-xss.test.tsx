// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ArticleContent from '@/components/articles/ArticleContent'

const MOCK_AUTHOR = { name: 'Test', role: 'Mentor', bio: 'Bio', avatar: '/avatar.jpg' }

const XSS_CONTENT = [
  {
    _type: 'block',
    _key: 'a',
    style: 'normal',
    children: [{ _type: 'span', _key: 'b', text: '<script>alert("xss")</script>', marks: [] }],
    markDefs: [],
  },
]

describe('ArticleContent PortableText XSS', () => {
  it('renders script tag content as escaped text, not executable', () => {
    render(<ArticleContent author={MOCK_AUTHOR} content={XSS_CONTENT} />)
    const scripts = document.querySelectorAll('script')
    const injected = Array.from(scripts).filter(s => s.textContent?.includes('alert'))
    expect(injected).toHaveLength(0)
  })

  it('renders safe links correctly', () => {
    const LINK_CONTENT = [
      {
        _type: 'block', _key: 'c', style: 'normal',
        markDefs: [{ _type: 'link', _key: 'd', href: 'https://jenga365.com/about' }],
        children: [{ _type: 'span', _key: 'e', text: 'Safe link', marks: ['d'] }],
      },
    ]
    render(<ArticleContent author={MOCK_AUTHOR} content={LINK_CONTENT} />)
    const link = screen.getByText('Safe link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://jenga365.com/about')
  })

  it('renders unsafe external links as plain text', () => {
    const UNSAFE_CONTENT = [
      {
        _type: 'block', _key: 'f', style: 'normal',
        markDefs: [{ _type: 'link', _key: 'g', href: 'javascript:alert(1)' }],
        children: [{ _type: 'span', _key: 'h', text: 'Evil link', marks: ['g'] }],
      },
    ]
    render(<ArticleContent author={MOCK_AUTHOR} content={UNSAFE_CONTENT} />)
    const text = screen.getByText('Evil link')
    expect(text.tagName).not.toBe('A')
  })
})
