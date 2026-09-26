import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroSection } from './HeroSection'

describe('Kapitalis hero', () => {
  it('hero_primary_contact_targets_published_whatsapp', () => {
    render(<HeroSection />)

    expect(
      screen
        .getByRole('link', { name: 'Conversar com a Kapitalis' })
        .getAttribute('href'),
    ).toBe('https://wa.me/5527998829289')
    expect(
      screen
        .getByRole('link', { name: 'Conhecer o sistema Kapitalis' })
        .getAttribute('href'),
    ).toBe('#sistema')
  })

  it('hero_financial_values_are_labeled_demonstrative', () => {
    render(<HeroSection />)

    const notice = screen.getByText(
      'AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS',
    )

    expect(notice.hidden).toBe(false)
    expect(notice.closest('[hidden]')).toBeNull()
    expect(
      screen.getByRole('region', { name: 'Mesa de Controle Financeira' }),
    ).toBeTruthy()
  })
})
