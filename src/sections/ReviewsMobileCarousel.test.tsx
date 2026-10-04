import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

const { instances, createEmbla } = vi.hoisted(() => {
  const instances: {
    destroy: ReturnType<typeof vi.fn>
    reInit: ReturnType<typeof vi.fn>
    viewport: HTMLElement
    options: Record<string, unknown>
    plugins: { name: string; options: Record<string, unknown> }[]
  }[] = []
  const createEmbla = vi.fn((viewport: HTMLElement, options: Record<string, unknown>, plugins: { name: string; options: Record<string, unknown> }[]) => {
    const instance = { destroy: vi.fn(), reInit: vi.fn(), viewport, options, plugins }
    instances.push(instance)
    return instance
  })
  return { instances, createEmbla }
})
// Keep the real React hook and plugin factory. Stub only the underlying engine:
// layout/input physics are verified in a browser, not against jsdom's zero sizes.
vi.mock('embla-carousel', () => ({ default: createEmbla }))

beforeEach(() => {
  instances.length = 0
  createEmbla.mockClear()
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('700px') }))
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => {})
})
afterEach(() => vi.unstubAllGlobals())

describe('official mobile Embla integration', () => {
  it('renders nine real React reviews as direct slides with no duplicate sets', async () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const viewport = container.querySelector('[data-review-mobile]')!
    expect(viewport).toBeTruthy()
    expect(viewport.querySelectorAll('article')).toHaveLength(9)
    expect(viewport.querySelector('[data-review-rail]')!.children).toHaveLength(9)
    expect(viewport.querySelector('[data-review-set]')).toBeNull()
    expect(container.innerHTML).not.toContain('bro-marquee')
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(Array.from(viewport.querySelectorAll<HTMLElement>('[data-review-id]'), slide => slide.dataset.reviewId)).toEqual(googleReviewsSnapshot.reviews.map(review => review.id))
    const ids = Array.from(container.querySelectorAll('[id]'), node => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses the official loop/dragFree and Auto Scroll configuration', async () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    expect(createEmbla).toHaveBeenCalledTimes(1)
    expect(instances[0]!.options).toEqual({ loop: true, dragFree: true, containScroll: false, align: 'start', container: '[data-review-rail]' })
    expect(instances[0]!.plugins).toHaveLength(1)
    expect(instances[0]!.plugins[0]!.name).toBe('autoScroll')
    expect(instances[0]!.plugins[0]!.options).toEqual({
      speed: 0.266,
      startDelay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
      breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
    })
  })

  it('keeps React expansion local to one review without recreating the carousel', async () => {
    const view = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const article = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
    const button = within(article).getByRole('button', { name: 'Ler mais' })
    fireEvent.click(button)
    expect(article.dataset.expanded).toBe('true')
    expect(button.textContent).toBe('Recolher')
    expect(article.textContent).toContain('hoje em dia pra achar profissional bom ta muito difícil.')
    expect(screen.getByRole('article', { name: 'Avaliação de Maicon C. Boone' }).dataset.expanded).toBe('false')
    view.rerender(<ReviewsSection data={{ ...googleReviewsSnapshot, reviews: [...googleReviewsSnapshot.reviews] }} />)
    expect(article.dataset.expanded).toBe('true')
    fireEvent.click(button)
    expect(article.dataset.expanded).toBe('false')
    expect(createEmbla).toHaveBeenCalledTimes(1)
    expect(instances[0]!.reInit).not.toHaveBeenCalled()
  })

  it('lets the real hook dispose every instance on StrictMode unmount', async () => {
    const view = render(<StrictMode><ReviewsSection data={googleReviewsSnapshot} /></StrictMode>)
    await act(async () => {})
    expect(instances.filter(instance => instance.destroy.mock.calls.length === 0)).toHaveLength(1)
    expect(view.container.querySelectorAll('article')).toHaveLength(9)
    view.unmount()
    expect(instances.length).toBeGreaterThan(0)
    expect(instances.every(instance => instance.destroy.mock.calls.length === 1)).toBe(true)
  })

  it('destroys Embla on desktop and creates one fresh instance on returning to mobile', async () => {
    let mobile = true
    const listeners = new Set<() => void>()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('700px') && mobile,
      addEventListener: (_event: string, callback: () => void) => listeners.add(callback),
      removeEventListener: (_event: string, callback: () => void) => listeners.delete(callback),
    }))
    const view = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const mobileViewport = instances[0]!.viewport
    act(() => { mobile = false; Array.from(listeners).forEach(callback => callback()) })
    expect(instances[0]!.destroy).toHaveBeenCalledTimes(1)
    expect(view.container.querySelector('[data-review-mobile]')).toBeNull()
    expect(Array.from(view.container.querySelectorAll<HTMLElement>('[data-review-set]'), set => set.dataset.reviewSet)).toEqual(['primary', 'duplicate'])
    expect(view.container.querySelector('[data-review-set="duplicate"]')!.hasAttribute('inert')).toBe(true)
    act(() => { mobile = true; Array.from(listeners).forEach(callback => callback()) })
    await act(async () => {})
    expect(createEmbla).toHaveBeenCalledTimes(2)
    expect(instances[1]!.viewport).not.toBe(mobileViewport)
    expect(view.container.querySelectorAll('article')).toHaveLength(9)
    expect(instances[1]!.viewport.querySelectorAll('[data-review-card]')).toHaveLength(9)
  })

  it('does not instantiate Embla on desktop', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    expect(createEmbla).not.toHaveBeenCalled()
    expect(container.querySelectorAll('[data-review-set]')).toHaveLength(2)
  })
})
