import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeroSection } from './HeroSection'

describe('Kapitalis hero', () => {
  it('hero_primary_contact_targets_published_whatsapp', () => {
    render(<HeroSection />)

    const primaryAction = screen.getByRole('link', {
      name: 'Conversar com a Kapitalis (abre em nova aba)',
    })
    expect(primaryAction.getAttribute('href')).toBe('https://wa.me/5527998829289')
    expect(primaryAction.getAttribute('target')).toBe('_blank')
    expect(primaryAction.getAttribute('rel')).toBe('noopener noreferrer')

    const secondaryAction = screen.getByRole('link', {
      name: 'Como a Kapitalis acompanha sua empresa',
    })
    expect(secondaryAction.getAttribute('href')).toBe('#sistema')
    expect(secondaryAction.tagName).toBe('A')
  })

  it('hero_and_story_share_one_financial_core', () => {
    render(<HeroSection />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(document.querySelectorAll('[data-financial-core]')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Kapitalis Contabilidade & BPO Financeiro' })).toBeTruthy()
    expect(screen.queryByText(/Sistema Kapitalis/i)).toBeNull()
    expect(
      screen.queryByRole('region', { name: 'Mesa de Controle Financeira' }),
    ).toBeNull()
    const scrollCue = screen.getByRole('link', {
      name: 'Conhecer o acompanhamento da Kapitalis',
    })
    expect(scrollCue.getAttribute('href')).toBe('#sistema')
    expect(scrollCue.textContent?.trim()).toBe('SCROLL')
    expect(scrollCue.querySelectorAll('[data-scroll-indicator]')).toHaveLength(1)

    const heading = screen.getByRole('heading', { level: 1 })
    const firstChapter = screen.getByText('01 · ACOMPANHAMENTO')
    expect(
      heading.compareDocumentPosition(firstChapter) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('hero_uses_the_real_responsible_person_photo_and_keeps_the_story_core', () => {
    render(<HeroSection />)

    const portrait = screen.getByRole('img', { name: 'Responsável pela Kapitalis' })
    expect(portrait.getAttribute('src')).toBe(
      '/assets/kapitalis-responsavel-recortado.png',
    )
    expect(
      portrait.closest('[data-hero-portrait]')?.getAttribute('data-portrait-crop'),
    ).toBe('upper-torso')
    expect(document.querySelectorAll('[data-financial-core]')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Kapitalis Contabilidade & BPO Financeiro' })).toBeTruthy()
  })

  it('hero_eyebrow_has_no_decorative_dash_and_preserves_locality_punctuation', () => {
    render(<HeroSection />)

    const eyebrow = document.querySelector('[data-entry="eyebrow"]')
    expect(eyebrow?.querySelector('span')).toBeNull()
    expect(eyebrow?.textContent).toContain('Vila Velha — ES')
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
      expect(screen.getByRole('heading', { name: 'Acompanhamento' })).toBeTruthy()
    } finally {
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })

  it('desktop_pointer_moves_only_the_hero_atmosphere_with_a_coalesced_frame', () => {
    const originalInnerWidth = window.innerWidth
    const originalInnerHeight = window.innerHeight
    const frames: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(hover: hover) and (pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    Object.defineProperties(window, {
      innerWidth: { configurable: true, value: 1440 },
      innerHeight: { configurable: true, value: 900 },
    })

    try {
      render(<HeroSection />)
      const experience = document.querySelector<HTMLElement>('#inicio')!
      const heading = screen.getByRole('heading', { level: 1 })
      const copy = heading.parentElement
      const portrait = experience.querySelector<HTMLElement>('[data-hero-portrait]')
      const framesBeforePointer = requestFrame.mock.calls.length

      fireEvent.pointerMove(experience, {
        pointerType: 'mouse',
        clientX: 1440,
        clientY: 0,
      })
      fireEvent.pointerMove(experience, {
        pointerType: 'mouse',
        clientX: 1440,
        clientY: 0,
      })

      expect(requestFrame).toHaveBeenCalledTimes(framesBeforePointer + 1)
      act(() => {
        frames.splice(0).forEach((callback) => callback(16))
      })

      const x = Number.parseFloat(experience.style.getPropertyValue('--hero-atmosphere-x'))
      const y = Number.parseFloat(experience.style.getPropertyValue('--hero-atmosphere-y'))
      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
      expect(Math.abs(x)).toBeLessThanOrEqual(6)
      expect(Math.abs(y)).toBeLessThanOrEqual(6)
      expect(copy?.hasAttribute('style')).toBe(false)
      expect(portrait?.hasAttribute('style')).toBe(false)
    } finally {
      vi.unstubAllGlobals()
      Object.defineProperties(window, {
        innerWidth: { configurable: true, value: originalInnerWidth },
        innerHeight: { configurable: true, value: originalInnerHeight },
      })
      requestFrame.mockRestore()
    }
  })

  it('reduced_motion_keeps_the_hero_atmosphere_static', () => {
    const originalInnerWidth = window.innerWidth
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ||
        query === '(hover: hover) and (pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    })

    try {
      render(<HeroSection />)
      const experience = document.querySelector<HTMLElement>('#inicio')!
      const atmosphere = experience.querySelector('[data-hero-atmosphere]')

      expect(atmosphere).toBeTruthy()
      fireEvent.pointerMove(experience, {
        pointerType: 'mouse',
        clientX: 1440,
        clientY: 0,
      })
      expect(experience.style.getPropertyValue('--hero-atmosphere-x')).toBe('')
      expect(experience.style.getPropertyValue('--hero-atmosphere-y')).toBe('')
    } finally {
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })

  it('touch_pointer_does_not_move_the_hero_atmosphere', () => {
    const originalInnerWidth = window.innerWidth
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    })

    try {
      render(<HeroSection />)
      const experience = document.querySelector<HTMLElement>('#inicio')!
      const atmosphere = experience.querySelector('[data-hero-atmosphere]')

      expect(atmosphere).toBeTruthy()
      fireEvent.pointerMove(experience, {
        pointerType: 'touch',
        clientX: 390,
        clientY: 0,
      })
      expect(experience.style.getPropertyValue('--hero-atmosphere-x')).toBe('')
      expect(experience.style.getPropertyValue('--hero-atmosphere-y')).toBe('')
    } finally {
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })
})
