import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('offers accessible previous/next controls while keeping the Google mark', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.queryByText(/Arraste para explorar/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Avaliação anterior' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Próxima avaliação' })).toBeTruthy()
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

  it('pauses only on mouse hover and resumes immediately without manual navigation', () => {
    const frames = new Map<number, FrameRequestCallback>()
    let nextFrame = 0
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = ++nextFrame
      frames.set(id, callback)
      return id
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id) })
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
      expect(track.hasAttribute('tabindex')).toBe(false)

      const runFrame = (time: number) => {
        const entry = frames.entries().next().value as [number, FrameRequestCallback] | undefined
        expect(entry).toBeTruthy()
        frames.delete(entry![0])
        entry![1](time)
      }

      runFrame(16)
      runFrame(1016)
      expect(rail.style.transform).toBe('translate3d(-1.92px, 0, 0)')
      const beforeHover = rail.style.transform

      fireEvent.mouseEnter(track)
      expect(frames.size).toBe(0)
      fireEvent.pointerDown(track, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 200,
        button: 0,
      })
      fireEvent.pointerMove(window, {
        pointerType: 'mouse',
        pointerId: 1,
        clientX: 160,
        button: 0,
      })
      expect(rail.style.transform).toBe(beforeHover)

      fireEvent.mouseLeave(track)
      expect(frames.size).toBe(1)
      runFrame(2016)
      runFrame(3016)
      expect(rail.style.transform).toBe('translate3d(-3.84px, 0, 0)')

      const reviewButton = within(screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' }))
        .getByRole('button', { name: 'Ler mais' })
      fireEvent.focus(reviewButton)
      runFrame(4016)
      expect(rail.style.transform).toBe('translate3d(-5.76px, 0, 0)')
    } finally {
      vi.unstubAllGlobals()
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
      measureRects.mockRestore()
    }
  })

  it('keeps review controls accessible without using keyboard focus to navigate the rail', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
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

      const initialTransform = rail.style.transform
      fireEvent.focus(button)

      expect(rail.style.transform).toBe(initialTransform)
    } finally {
      vi.unstubAllGlobals()
      measureRects.mockRestore()
    }
  })

  it('does not respond to manual pointer dragging on review controls', () => {
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
