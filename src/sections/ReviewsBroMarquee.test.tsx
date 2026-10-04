import { act, render, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'
import BroInfiniteMarquee from '@bro-design/bro-marquee/dist/bro-marquee.min.js?react'

const disconnect = vi.fn()
const observe = vi.fn()
beforeEach(() => {
  disconnect.mockClear()
  observe.mockClear()
  vi.stubGlobal('IntersectionObserver', class {
    observe = observe
    disconnect = disconnect
  })
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('700px') }))
  // jsdom has no layout. Leave real-engine motion to browser verification;
  // these tests assert our DOM/lifecycle contract without running its physics.
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => vi.unstubAllGlobals())

describe('official broMarquee mobile integration', () => {
  it('gives the official motor one list of nine real reviews', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('700px') }))
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const root = container.querySelector('[bro-marquee-element="marquee"]')!
    expect(root).toBeTruthy()
    expect(root.getAttribute('bro-marquee-speed-mobile')).toBe('0.26672')
    expect(root.getAttribute('bro-marquee-clones')).toBe('1')
    expect(container.querySelectorAll('[data-review-set]')).toHaveLength(1)
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(root.querySelectorAll('[data-review-card]')).toHaveLength(18)
    expect(container.querySelector('[data-review-set="previous"]')).toBeNull()
    expect(container.querySelector('[data-review-set="primary"]')).toBeNull()
    expect(container.querySelector('[data-review-set="next"]')).toBeNull()
  })

  it('keeps one instance on rerender and mirrors expansion from a native copy', async () => {
    const view = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const track = view.container.querySelector<HTMLElement>('[data-review-track]')! as HTMLElement & { __marqueeInstance: BroInfiniteMarquee }
    const instance = track.__marqueeInstance
    const copy = track.querySelector<HTMLElement>('[data-review-card][aria-hidden="true"] button')!.closest<HTMLElement>('[data-review-card]')!
    const original = track.querySelector<HTMLElement>(`[data-review-id="${copy.dataset.reviewId}"]`)!
    const copyButton = copy.querySelector('button')!
    expect(copyButton.tabIndex).toBe(-1)
    fireEvent.click(copyButton)
    await act(async () => {})
    expect(copyButton.getAttribute('aria-expanded')).toBe('true')
    expect(original.querySelector('button')!.getAttribute('aria-expanded')).toBe('true')
    expect(copy.querySelector('blockquote')!.textContent).toBe(original.querySelector('blockquote')!.textContent)
    fireEvent.click(original.querySelector('button')!)
    await act(async () => {})
    expect(copyButton.textContent).toBe('Ler mais')
    view.rerender(<ReviewsSection data={{ ...googleReviewsSnapshot }} />)
    await act(async () => {})
    expect(track.__marqueeInstance).toBe(instance)
    expect(observe).toHaveBeenCalledTimes(1)
    const ids = Array.from(view.container.querySelectorAll('[id]'), element => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(screen.getAllByRole('article')).toHaveLength(9)
  })

  it('cleans StrictMode remounts, native listeners, clones, observers and frames', async () => {
    const frames = new Map<number, FrameRequestCallback>()
    let nextId = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++nextId, callback); return nextId })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    const removeListener = vi.spyOn(EventTarget.prototype, 'removeEventListener')
    const removeWindowListener = vi.spyOn(window, 'removeEventListener')
    const destroy = vi.spyOn(BroInfiniteMarquee.prototype, 'destroy')
    const view = render(<StrictMode><ReviewsSection data={googleReviewsSnapshot} /></StrictMode>)
    await act(async () => {})
    const list = view.container.querySelector('[bro-marquee-element="list"]')!
    const rail = view.container.querySelector('[data-review-rail]')!
    expect(list.children).toHaveLength(18)
    expect(observe).toHaveBeenCalledTimes(1)
    fireEvent.mouseDown(rail, { clientX: 200 })
    view.unmount()
    expect(destroy).toHaveBeenCalledTimes(2)
    expect(list.children).toHaveLength(9)
    expect(frames.size).toBe(0)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(removeListener.mock.calls.some(([type]) => type === 'touchmove')).toBe(true)
    expect(removeWindowListener.mock.calls.some(([type]) => type === 'resize')).toBe(true)
    removeListener.mockRestore()
    removeWindowListener.mockRestore()
    destroy.mockRestore()
  })

  it('disposes the mobile instance before restoring the approved desktop sets', async () => {
    let mobile = true
    const subscriptions = new Set<() => void>()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('700px') && mobile,
      addEventListener: (_type: string, callback: () => void) => subscriptions.add(callback),
      removeEventListener: (_type: string, callback: () => void) => subscriptions.delete(callback),
    }))
    const destroy = vi.spyOn(BroInfiniteMarquee.prototype, 'destroy')
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    act(() => { mobile = false; Array.from(subscriptions).forEach(callback => callback()) })
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[bro-marquee-element="marquee"]')).toBeNull()
    expect(Array.from(container.querySelectorAll<HTMLElement>('[data-review-set]'), set => set.dataset.reviewSet)).toEqual(['primary', 'duplicate'])
    act(() => { mobile = true; Array.from(subscriptions).forEach(callback => callback()) })
    await act(async () => {})
    expect(container.querySelectorAll('[data-review-card]')).toHaveLength(18)
    destroy.mockRestore()
  })

  it('mirrors the React avatar fallback into official copies', async () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    await act(async () => {})
    const photo = screen.getByRole('img', { name: 'Foto de claudinei bazoni' })
    fireEvent.error(photo)
    await act(async () => {})
    const cards = container.querySelectorAll('[data-review-id="claudinei-bazoni"]')
    expect(cards).toHaveLength(2)
    for (const card of cards) {
      expect(card.querySelector('img')).toBeNull()
      expect(card.textContent).toContain('CB')
    }
  })

  it('cancels frames started by native inertia when unmounted', async () => {
    const width = vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(3000)
    const frames = new Set<number>()
    let nextId = 0
    vi.stubGlobal('requestAnimationFrame', () => { frames.add(++nextId); return nextId })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000)
    try {
      const view = render(<ReviewsSection data={googleReviewsSnapshot} />)
      await act(async () => {})
      const rail = view.container.querySelector('[data-review-rail]')!
      fireEvent.mouseDown(rail, { clientX: 200 })
      fireEvent.mouseMove(document, { clientX: 100 })
      now.mockReturnValue(1050)
      fireEvent.mouseUp(document, { clientX: 100 })
      expect(frames.size).toBeGreaterThan(0)
      view.unmount()
      expect(frames.size).toBe(0)
    } finally { width.mockRestore(); now.mockRestore() }
  })

  it('clears the official wheel debounce timer during cleanup', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const width = vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(3000)
    try {
      const view = render(<ReviewsSection data={googleReviewsSnapshot} />)
      await act(async () => {})
      fireEvent.wheel(view.container.querySelector('[data-review-rail]')!, { deltaX: 100, deltaY: 0 })
      expect(vi.getTimerCount()).toBe(1)
      view.unmount()
      expect(vi.getTimerCount()).toBe(0)
    } finally { width.mockRestore(); vi.useRealTimers() }
  })
})
