import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

describe('Google Reviews section', () => {
  it('renders nine real reviews without an aggregate block or external navigation', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.queryByText('5,0')).toBeNull()
    expect(screen.queryByText('52 avaliações no Google')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Ver avaliações no Google' })).toBeNull()
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
    for (const review of screen.getAllByRole('article')) {
      expect(within(review).queryAllByRole('link')).toHaveLength(0)
    }
  })

  it('omits the carousel hint and arrow controls while keeping the Google mark', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.queryByText(/Arraste para explorar/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Avaliações anteriores' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Próximas avaliações' })).toBeNull()
    for (const review of screen.getAllByRole('article')) {
      expect(within(review).getByRole('img', { name: 'Google' })).toBeTruthy()
    }
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
    const sibling = screen.getByRole('article', { name: 'Avaliação de Maicon C. Boone' })
    const siblingExpand = within(sibling).getByRole('button', { name: 'Ler mais' })
    expect(within(review).getByText(/Melhor coisa que fiz/).textContent).not.toContain(
      'hoje em dia pra achar profissional bom ta muito difícil.',
    )

    const expand = within(review).getByRole('button', { name: 'Ler mais' })
    fireEvent.click(expand)

    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(expand.textContent).toBe('Recolher')
    expect(review.dataset.expanded).toBe('true')
    expect(sibling.dataset.expanded).toBe('false')
    expect(siblingExpand.getAttribute('aria-expanded')).toBe('false')
    expect(siblingExpand.textContent).toBe('Ler mais')
    expect(
      within(review).getByText(/hoje em dia pra achar profissional bom ta muito difícil\./),
    ).toBeTruthy()
  })

  it('shows a verified reviewer photo or the author initials fallback', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)
    const reviews = screen.getAllByRole('article')
    const portraits = reviews.filter((review) => within(review).queryByRole('img', { name: /^Foto de / }))
    expect(portraits).toHaveLength(3)
    expect(within(screen.getByRole('article', { name: 'Avaliação de Jimmy Campos' })).getByText('JC')).toBeTruthy()
    const claudinei = screen.getByRole('article', { name: 'Avaliação de claudinei bazoni' })
    const portrait = within(claudinei).getByRole('img', { name: 'Foto de claudinei bazoni' })
    fireEvent.error(portrait)
    expect(within(claudinei).getByText('CB')).toBeTruthy()
    expect(reviews.every((review) => within(review).getByText('5 de 5 estrelas'))).toBe(true)
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

  it('preserves the mobile swipe position when a review expands and collapses', () => {
    let resizeCallback: ResizeObserverCallback | undefined
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('max-width: 700px') }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }
        observe() {}
        disconnect() {}
      },
    )

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const review = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
      const expand = within(review).getByRole('button', { name: 'Ler mais' })
      track.scrollLeft = 240

      fireEvent.click(expand)
      resizeCallback?.([], {} as ResizeObserver)
      expect(track.scrollLeft).toBe(240)

      fireEvent.click(expand)
      resizeCallback?.([], {} as ResizeObserver)
      expect(track.scrollLeft).toBe(240)
    } finally {
      vi.unstubAllGlobals()
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

  it('uses a fifty-second seamless loop and runs only while the rail is visible', () => {
    const frames: FrameRequestCallback[] = []
    let observerCallback: IntersectionObserverCallback | undefined
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!

      expect(frames).toHaveLength(0)
      observerCallback?.(
        [{ isIntersecting: true, target: track } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
      frames.shift()?.(0)
      frames.shift()?.(50)

      expect(rail.style.transform).toBe('translate3d(-1.016px, 0, 0)')
      fireEvent.pointerDown(track, {
        pointerType: 'mouse',
        pointerId: 2,
        clientX: 10000,
        button: 0,
      })
      fireEvent.pointerMove(track, {
        pointerType: 'mouse',
        pointerId: 2,
        clientX: 8986.016,
        button: 0,
      })
      fireEvent.pointerUp(track, { pointerType: 'mouse', pointerId: 2 })
      expect(rail.style.transform).toBe('translate3d(-1015px, 0, 0)')
      frames.shift()?.(100)
      expect(rail.style.transform).toBe('translate3d(-0.016px, 0, 0)')

      observerCallback?.(
        [{ isIntersecting: false, target: track } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
      expect(cancelFrame).toHaveBeenCalled()
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

  it('does not start a drag from an interactive review control', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
      const review = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
      const reviewButton = within(review).getByRole('button', { name: 'Ler mais' })

      fireEvent.pointerDown(reviewButton, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 200,
        button: 0,
      })
      fireEvent.pointerMove(reviewButton, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 150,
        button: 0,
      })
      fireEvent.pointerUp(reviewButton, { pointerType: 'mouse', pointerId: 1 })

      expect(rail.style.transform).toBe('translate3d(0px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      measureRects.mockRestore()
    }
  })
})
