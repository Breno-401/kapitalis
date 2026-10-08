import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

let frames: Map<number, FrameRequestCallback>
let frameId: number
let reduced: boolean

function tick(time: number) {
  act(() => {
    const pending = Array.from(frames.entries())
    frames.clear()
    pending.forEach(([, callback]) => callback(time))
  })
}
function offset(rail: HTMLElement) {
  return -Number(rail.style.transform.match(/translate3d\(([-\d.]+)px/)?.[1])
}

beforeEach(() => {
  frames = new Map()
  frameId = 0
  reduced = false
  vi.stubGlobal('IntersectionObserver', undefined)
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') && reduced }))
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++frameId
    frames.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const left = this.dataset.reviewSet === 'duplicate' ? 2880 :
      this.hasAttribute('data-review-card') ? Array.from(this.parentElement!.children).indexOf(this) * 320 : 0
    return { left, right: left + 304, width: 304, top: 0, bottom: 400, height: 400 } as DOMRect
  })
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('desktop manual navigation in the infinite rail', () => {
  it('moves one measured card per click indefinitely in both directions while hover pauses autoplay', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    const track = container.querySelector<HTMLElement>('[data-review-track]')!
    const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
    fireEvent.mouseEnter(track)
    let time = 0
    for (const [label, expected] of [
      ['Avaliação anterior', 1920], ['Próxima avaliação', 0], ['Avaliação anterior', 1920],
    ] as const) {
      for (let index = 0; index < 30; index++) {
        fireEvent.click(screen.getByRole('button', { name: label }))
        expect(frames.size).toBe(1)
        tick(time)
        tick(time + 400)
        time += 500
        expect(offset(rail)).toBeGreaterThanOrEqual(0)
        expect(offset(rail)).toBeLessThan(2880)
        expect(frames.size).toBe(0)
      }
      expect(offset(rail)).toBeCloseTo(expected)
    }
    fireEvent.mouseLeave(track)
    tick(time)
    tick(time + 50)
    expect(offset(rail)).toBeCloseTo(1921.2)
    expect(track.scrollLeft).toBe(0)
  })

  it('suspends autoplay during manual movement and resumes from the resulting offset', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
    tick(0)
    tick(50)
    expect(offset(rail)).toBeCloseTo(1.2)
    fireEvent.click(screen.getByRole('button', { name: 'Próxima avaliação' }))
    tick(100)
    tick(500)
    expect(offset(rail)).toBeCloseTo(321.2)
    expect(frames.size).toBe(1)
    tick(550)
    expect(offset(rail)).toBeCloseTo(322.4)
  })

  it('handles rapid clicks with one animation writer and no stale completion', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
    const track = container.querySelector<HTMLElement>('[data-review-track]')!
    fireEvent.mouseEnter(track)
    for (let index = 0; index < 30; index++) fireEvent.click(screen.getByRole('button', { name: 'Próxima avaliação' }))
    expect(frames.size).toBe(1)
    tick(0)
    tick(400)
    expect(offset(rail)).toBe(960)
    expect(frames.size).toBe(0)
  })

  it('keeps arrows working instantly with reduced motion and never starts autoplay', () => {
    reduced = true
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
    fireEvent.click(screen.getByRole('button', { name: 'Avaliação anterior' }))
    expect(offset(rail)).toBe(2560)
    fireEvent.click(screen.getByRole('button', { name: 'Próxima avaliação' }))
    expect(offset(rail)).toBeCloseTo(0)
    expect(frames.size).toBe(0)
  })

  it('retargets a reversal mid-animation without losing position or adding autoplay movement', () => {
    const { container } = render(<ReviewsSection data={googleReviewsSnapshot} />)
    const rail = container.querySelector<HTMLElement>('[data-review-rail]')!
    fireEvent.mouseEnter(container.querySelector('[data-review-track]')!)
    fireEvent.click(screen.getByRole('button', { name: 'Próxima avaliação' }))
    tick(0)
    tick(160)
    expect(offset(rail)).toBe(280)
    fireEvent.click(screen.getByRole('button', { name: 'Avaliação anterior' }))
    expect(offset(rail)).toBe(280)
    expect(frames.size).toBe(1)
    tick(200)
    tick(600)
    expect(offset(rail)).toBeCloseTo(0)
    expect(frames.size).toBe(0)
  })
})
