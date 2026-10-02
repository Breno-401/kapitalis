import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { site } from '../data/site'
import { FinalCtaSection } from './FinalCtaSection'

describe('final contact section', () => {
  it('closes the narrative with a clear secure WhatsApp invitation', () => {
    render(<FinalCtaSection />)

    expect(
      screen.getByRole('heading', { name: 'Vamos conversar sobre a rotina da sua empresa.' }),
    ).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Conversar no WhatsApp (abre em nova aba)' })
    expect(link.getAttribute('href')).toBe(site.whatsappUrl)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('uses a transparent decorative portrait beside the final invitation', () => {
    const { container } = render(<FinalCtaSection />)
    const portrait = container.querySelector('img')

    expect(portrait?.getAttribute('src')).toBe('/images/next-step-person.png')
    expect(portrait?.getAttribute('alt')).toBe('')
  })
})
