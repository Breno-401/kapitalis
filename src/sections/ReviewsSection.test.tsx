import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

describe('Google Reviews section', () => {
  it('renders the verified Google proof block and links both CTAs to the Kapitalis profile', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.getByText('5,0')).toBeTruthy()
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeTruthy()
    expect(screen.getByText('Mais de 50 avaliações no Google')).toBeTruthy()
    expect(
      screen.getByRole('link', {
        name: 'Google, nota 5,0 de 5 estrelas. Mais de 50 avaliações no Google. Ver avaliações no Google (abre em nova aba)',
      }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver todas no Google (abre em nova aba)' })).toBeTruthy()
    expect(screen.getByText('Ver todas no Google')).toBeTruthy()

    const profileLinks = container.querySelectorAll<HTMLAnchorElement>('[data-google-profile-link]')
    expect(profileLinks).toHaveLength(2)
    for (const link of profileLinks) {
      expect(link.href).toBe(googleReviewsSnapshot.sourceUrl)
      expect(link.target).toBe('_blank')
      expect(link.rel).toContain('noopener')
      expect(link.rel).toContain('noreferrer')
    }
    expect(screen.queryByText('52 avaliações no Google')).toBeNull()
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

  it('keeps the aggregate proof beside the heading and the closing CTA after the review rail', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)

    const section = container.querySelector<HTMLElement>('#avaliacoes')!
    const header = section.querySelector<HTMLElement>('[data-review-header]')!
    const proof = section.querySelector<HTMLElement>('[data-review-proof]')!
    const trackFrame = section.querySelector<HTMLElement>('[data-review-frame]')!
    const closingCta = section.querySelector<HTMLElement>('[data-review-closing-cta]')!

    expect(section.dataset.themeSurface).toBe('dark')
    expect(header.contains(proof)).toBe(true)
    expect(trackFrame.compareDocumentPosition(closingCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it.each([
    [320, 812],
    [375, 812],
    [390, 844],
    [402, 874],
    [430, 932],
  ])('gives mobile touch control priority at %i×%i', (width, height) => {
    const frames = new Map<number, FrameRequestCallback>()
    let nextFrameId = 0
    let observerCallback: IntersectionObserverCallback | undefined
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = ++nextFrameId
      frames.set(id, callback)
      return id
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id)
    })
    vi.stubGlobal('innerWidth', width)
    vi.stubGlobal('innerHeight', height)
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('max-width: 700px') && width <= 700,
    }))
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
        if (this.matches('[data-review-track]')) {
          return { left: 0, right: width, width, top: 0, bottom: 400, height: 400 } as DOMRect
        }
        if (this.hasAttribute('data-review-card')) {
          const index = Array.prototype.indexOf.call(this.parentElement!.children, this) as number
          const duplicate = this.parentElement?.dataset.reviewSet === 'duplicate' ? 1016 : 0
          const rail = this.parentElement?.parentElement
          const translation = Number(rail?.style.transform.match(/translate3d\((-?[\d.]+)px/)?.[1] ?? 0)
          const left = 24 + index * 110 + duplicate + translation
          return { left, right: left + 100, width: 100, top: 0, bottom: 300, height: 300 } as DOMRect
        }
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
      })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    let unmount: (() => void) | undefined

    try {
      const rendered = render(<ReviewsSection data={googleReviewsSnapshot} />)
      unmount = rendered.unmount
      const { container } = rendered
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
      const runFrame = (time: number) => {
        const next = frames.entries().next().value as [number, FrameRequestCallback] | undefined
        if (!next) return
        frames.delete(next[0])
        act(() => next[1](time))
      }

      observerCallback?.(
        [{ isIntersecting: true, target: track } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
      expect(window.matchMedia('(max-width: 700px)').matches).toBe(true)
      expect(observerCallback).toBeDefined()
      expect(document.visibilityState).not.toBe('hidden')
      expect(frames.size).toBe(1)
      runFrame(0)
      expect(frames.size).toBe(1)
      runFrame(50)
      expect(frames.size).toBe(1)
      expect(rail.style.transform).toBe('translate3d(-0.4px, 0, 0)')

      for (const [index, distance] of [-48, 48, -48, 48, -48, 48].entries()) {
        const pointerId = index + 1
        const initialTransform = rail.style.transform
        fireEvent.pointerDown(track, {
          pointerType: 'touch', pointerId, button: 0, clientX: 180, clientY: 180,
        })
        expect(cancelFrame).toHaveBeenCalled()
        expect(frames.size).toBe(0)
        fireEvent.pointerMove(track, {
          pointerType: 'touch', pointerId, button: 0,
          clientX: 180 + distance, clientY: 180,
        })
        expect(rail.style.transform).not.toBe(initialTransform)
        expect(frames.size).toBe(0)
        fireEvent.pointerUp(track, { pointerType: 'touch', pointerId })
        expect(track.dataset.dragging).toBe('false')
      }

      expect(track.dataset.dragging).toBe('false')
      expect(rail.dataset.settling).toBe('true')
      const center = width / 2
      const nearestCardCenterDistance = Math.min(
        ...Array.from(rail.querySelectorAll<HTMLElement>('[data-review-card]'), (card) => {
          const rect = card.getBoundingClientRect()
          return Math.abs(rect.left + rect.width / 2 - center)
        }),
      )
      expect(nearestCardCenterDistance).toBeLessThan(1)
      expect(frames.size).toBe(0)
      act(() => vi.advanceTimersByTime(2999))
      expect(frames.size).toBe(0)
      act(() => vi.advanceTimersByTime(1))
      expect(frames.size).toBe(1)

      const expandButton = screen.getAllByRole('button', { name: 'Ler mais' })[0]!
      fireEvent.pointerDown(expandButton, {
        pointerType: 'touch', pointerId: 8, button: 0, clientX: 180, clientY: 180,
      })
      expect(frames.size).toBe(0)
      fireEvent.pointerUp(expandButton, { pointerType: 'touch', pointerId: 8 })
      act(() => vi.advanceTimersByTime(2999))
      expect(frames.size).toBe(0)
      act(() => vi.advanceTimersByTime(1))
      expect(frames.size).toBe(1)

      const verticalMove = document.createEvent('Event')
      verticalMove.initEvent('pointermove', true, true)
      Object.assign(verticalMove, {
        pointerId: 7,
        pointerType: 'touch',
        button: 0,
        clientX: 180,
        clientY: 240,
      })
      fireEvent.pointerDown(track, {
        pointerType: 'touch', pointerId: 7, button: 0, clientX: 180, clientY: 180,
      })
      fireEvent(track, verticalMove)
      expect(verticalMove.defaultPrevented).toBe(false)
      expect(frames.size).toBe(0)
      fireEvent.pointerUp(track, { pointerType: 'touch', pointerId: 7 })
      act(() => vi.advanceTimersByTime(2999))
      expect(frames.size).toBe(0)
      act(() => vi.advanceTimersByTime(1))
      expect(frames.size).toBe(1)
    } finally {
      unmount?.()
      vi.useRealTimers()
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })

  it('uses the shared duplicated transform loop at mobile widths', () => {
    const frames: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('max-width: 700px') }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
      const sets = container.querySelectorAll('[data-review-set]')

      expect(sets).toHaveLength(2)
      frames.shift()?.(0)
      frames.shift()?.(50)

      expect(rail.style.transform).toBe('translate3d(-0.4px, 0, 0)')
      expect(track.scrollLeft).toBe(0)
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })

  it('preserves the mobile swipe position when a review expands and collapses', () => {
    let resizeCallback: ResizeObserverCallback | undefined
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
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
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const track = container.querySelector<HTMLElement>('[data-review-track]')!
      const review = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
      const expand = within(review).getByRole('button', { name: 'Ler mais' })
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
      fireEvent.pointerDown(track, {
        pointerType: 'touch',
        pointerId: 3,
        clientX: 240,
        button: 0,
      })
      fireEvent.pointerMove(track, {
        pointerType: 'touch',
        pointerId: 3,
        clientX: 180,
        button: 0,
      })
      fireEvent.pointerUp(track, { pointerType: 'touch', pointerId: 3 })
      expect(rail.style.transform).toBe('translate3d(-60px, 0, 0)')

      fireEvent.click(expand)
      resizeCallback?.([], {} as ResizeObserver)
      expect(track.scrollLeft).toBe(0)
      expect(rail.style.transform).toBe('translate3d(-60px, 0, 0)')

      fireEvent.click(expand)
      resizeCallback?.([], {} as ResizeObserver)
      expect(track.scrollLeft).toBe(0)
      expect(rail.style.transform).toBe('translate3d(-60px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
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
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
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

  it('moves the mobile loop at a reading-friendly speed and starts only while visible', () => {
    const frames: FrameRequestCallback[] = []
    let observerCallback: IntersectionObserverCallback | undefined
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('max-width: 700px') }))
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
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
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

      expect(rail.style.transform).toBe('translate3d(-0.4px, 0, 0)')

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
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
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
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
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

  it('keeps a focused review control visible without skipping a partially visible card', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('max-width: 700px') }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.hasAttribute('data-review-track')) {
          return { left: 0, right: 308, width: 308, top: 0, bottom: 448, height: 448 } as DOMRect
        }
        if (this.hasAttribute('data-review-card')) {
          return { left: 60, right: 370, width: 310, top: 0, bottom: 300, height: 300 } as DOMRect
        }
        if (this.tagName === 'BUTTON') {
          return { left: 250, right: 298, width: 48, top: 260, bottom: 280, height: 20 } as DOMRect
        }
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
      })

    try {
      const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
      const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
      const review = screen.getByRole('article', { name: 'Avaliação de Maicon C. Boone' })
      const button = within(review).getByRole('button', { name: 'Ler mais' })

      fireEvent.focus(button)

      expect(rail.style.transform).toBe('translate3d(0px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      measureRects.mockRestore()
    }
  })

  it('does not start a drag from an interactive review control', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const measureRects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
        return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
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
