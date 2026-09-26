import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

describe('Google Reviews section', () => {
  it('renders the verified aggregate and nine sourced customer reviews', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.getByText('5,0')).toBeTruthy()
    expect(screen.getByText('52 avaliações no Google')).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(
      within(screen.getByRole('article', { name: 'Avaliação de Jimmy Campos' })).getByText(
        'Jimmy Campos',
      ),
    ).toBeTruthy()
    expect(
      within(screen.getByRole('article', { name: 'Avaliação de Lorena Barros' })).getByText(
        'Lorena Barros',
      ),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Ver avaliações no Google' }).getAttribute('href'),
    ).toBe(googleReviewsSnapshot.sourceUrl)
  })

  it('loops a visual duplicate set without exposing duplicate reviews to assistive technology', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)

    const track = container.querySelector<HTMLElement>('[data-review-track]')
    const sets = container.querySelectorAll<HTMLElement>('[data-review-set]')

    expect(track).toBeTruthy()
    expect(sets).toHaveLength(2)
    expect(sets[0]?.querySelectorAll('article')).toHaveLength(9)
    expect(sets[1]?.querySelectorAll('article')).toHaveLength(9)
    expect(sets[1]?.getAttribute('aria-hidden')).toBe('true')
    expect(sets[1]?.hasAttribute('inert')).toBe(true)
    expect(screen.getAllByRole('article')).toHaveLength(9)
    const ids = Array.from(container.querySelectorAll<HTMLElement>('[id]')).map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the complete review available behind an accessible expansion', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    const review = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
    expect(within(review).getByText(/Melhor coisa que fiz/).textContent).not.toContain(
      'hoje em dia pra achar profissional bom ta muito difícil.',
    )

    const expand = within(review).getByRole('button', {
      name: 'Ler avaliação completa de Rafael de Oliveira Matos',
    })
    fireEvent.click(expand)

    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(
      within(review).getByText(/hoje em dia pra achar profissional bom ta muito difícil\./),
    ).toBeTruthy()
  })

  it('labels each five-star rating and links each review to its Google source', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    const reviews = screen.getAllByRole('article')
    expect(
      reviews.every((review) =>
        within(review).getByText('5 de 5 estrelas') &&
        within(review).getByRole('link', { name: /Ver avaliação de .+ no Google/ }),
      ),
    ).toBe(true)
    expect(document.querySelector('a[href="#"]')).toBeNull()
  })

  it('does_not_start_automatic_motion_when_reduced_motion_is_requested', () => {
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))

    try {
      render(<ReviewsSection data={googleReviewsSnapshot} />)

      expect(requestFrame).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
    }
  })

  it('moves the duplicated review rail with transform instead of scrolling the page track', () => {
    const frames: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!

      frames.shift()?.(16)
      frames.shift()?.(1016)

      expect(rail.style.transform).toMatch(/translate3d\(-[0-9]/)
      expect(track.scrollLeft).toBe(0)
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })

  it('pauses on hover and focus, supports pointer dragging, and resumes without a jump', () => {
    const frames: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!

      fireEvent.pointerEnter(track, { pointerType: 'mouse' })
      frames.shift()?.(16)
      frames.shift()?.(1016)
      expect(rail.style.transform).toBe('translate3d(0px, 0, 0)')

      fireEvent.pointerDown(track, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 200,
        button: 0,
      })
      fireEvent.pointerMove(track, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 160,
        button: 0,
      })
      expect(rail.style.transform).toBe('translate3d(-40px, 0, 0)')

      fireEvent.pointerUp(track, { pointerType: 'mouse', pointerId: 1 })
      frames.shift()?.(2016)
      expect(rail.style.transform).toBe('translate3d(-40px, 0, 0)')

      fireEvent.pointerLeave(track, { pointerType: 'mouse' })
      frames.shift()?.(3016)
      expect(rail.style.transform).not.toBe('translate3d(-40px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })

  it('pauses_automatic_motion_while_review_content_has_keyboard_focus', () => {
    const frames: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!

      fireEvent.focus(track)
      frames.shift()?.(16)
      frames.shift()?.(1016)
      expect(rail.style.transform).toBe('translate3d(0px, 0, 0)')

      fireEvent.blur(track, { relatedTarget: document.body })
      frames.shift()?.(2016)
      expect(rail.style.transform).not.toBe('translate3d(0px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })
})
