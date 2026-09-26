import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { site } from '../data/site'
import { FinalCtaSection } from './FinalCtaSection'

describe('final contact section', () => {
  it('offers a secure link to the published Kapitalis WhatsApp', () => {
    render(<FinalCtaSection />)

    const link = screen.getByRole('link', { name: 'Conversar com a Kapitalis' })
    expect(link.getAttribute('href')).toBe(site.whatsappUrl)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
