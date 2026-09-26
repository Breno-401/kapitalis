import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

  it('hero_and_story_share_one_financial_core', () => {
    render(<HeroSection />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(document.querySelectorAll('[data-financial-core]')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Sistema Kapitalis' })).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Mesa de Controle Financeira' }),
    ).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Rolar para o Sistema Kapitalis' }),
    ).toBeTruthy()

    const heading = screen.getByRole('heading', { level: 1 })
    const firstChapter = screen.getByText('01 · ENTRADAS')
    expect(
      heading.compareDocumentPosition(firstChapter) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('reduced_motion_keeps_hero_content_static_and_available', () => {
    const originalInnerWidth = window.innerWidth
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    })

    try {
      render(<HeroSection />)

      expect(document.querySelector('#inicio')?.getAttribute('data-static-layout'))
        .toBe('true')
      expect(document.querySelector('[data-intro-hidden="true"]')).toBeNull()
      expect(screen.getByRole('heading', { name: /Seus números sob controle/ }))
        .toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Entradas' })).toBeTruthy()
    } finally {
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })
})
