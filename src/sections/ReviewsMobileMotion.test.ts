import { fireEvent } from '@testing-library/react'
import { gsap } from 'gsap'
import { expect, it, vi } from 'vitest'
import { installReviewsMobileMotion } from './ReviewsMobileMotion'

function createMotion(reduced = true) {
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
  const callbacks = new Set<gsap.TickerCallback>()
  const add = vi.spyOn(gsap.ticker, 'add').mockImplementation(callback => { callbacks.add(callback); return callback })
  const remove = vi.spyOn(gsap.ticker, 'remove').mockImplementation(callback => { callbacks.delete(callback) })
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.tagName === 'BUTTON') {
      const scroll = this.closest('[data-review-track]')!.scrollLeft
      return { left: 800 - scroll, right: 850 - scroll, width: 50, top: 0, bottom: 30, height: 30 } as DOMRect
    }
    if (this.dataset.reviewTrack !== undefined) return { left: 0, right: 390, width: 390, top: 0, bottom: 400, height: 400 } as DOMRect
    const left = this.dataset.reviewSet === 'duplicate' ? 1016 : 0
    return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
  })
  const section = document.createElement('section')
  const track = document.createElement('div')
  const rail = document.createElement('div')
  rail.style.columnGap = '16px'
  track.dataset.reviewTrack = ''
  rail.innerHTML = '<ul data-review-set="primary"><li data-review-card><button>Ler mais</button></li></ul><ul data-review-set="duplicate"><li>Review</li></ul>'
  track.append(rail)
  section.append(track)
  document.body.append(section)
  const cleanup = installReviewsMobileMotion(section, track, rail)
  const frame = (delta = 16) => { for (const callback of callbacks) callback(0, delta, 1, 0) }
  return { track, rail, callbacks, frame, cleanup: () => {
    cleanup()
    section.remove()
    add.mockRestore()
    remove.mockRestore()
    measure.mockRestore()
    vi.unstubAllGlobals()
  } }
}

it('renders the final drag sample with reduced motion even when release precedes the next frame', () => {
  const { track, rail, callbacks, frame, cleanup } = createMotion()
  try {
    expect(callbacks.size).toBe(0)
    fireEvent.pointerDown(track, { pointerType: 'touch', pointerId: 1, clientX: 180, button: 0 })
    fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 1, clientX: 120 })
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-60)
    fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 1, clientX: 100 })
    fireEvent.pointerUp(window, { pointerType: 'touch', pointerId: 1 })
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-80)
    expect(callbacks.size).toBe(0)
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-80)
  } finally {
    cleanup()
  }
})

it('removes native touch-focus scroll before wrapping and keeps both directions covered over five periods', () => {
  const { track, rail, frame, cleanup } = createMotion()
  try {
    fireEvent.pointerDown(track, { pointerType: 'touch', pointerId: 1, clientX: 180, button: 0 })
    track.scrollLeft = 1600
    fireEvent.focusIn(rail.querySelector('button')!)
    // A touch focus must not leave a second, unwrapped coordinate on the viewport.
    expect(track.scrollLeft).toBe(0)
    for (const multiple of [0, 0.5, 1, 2, 5, -0.5, -1, -2, -5, 0]) {
      fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 1, clientX: 180 + 1016 * multiple })
      frame()
      const x = Number(gsap.getProperty(rail, 'x')) - track.scrollLeft
      const intervals = [[x, x + 1000], [x + 1016, x + 2016]]
      // Only the intentional 16px inter-card gap is allowed, never an empty tail.
      expect(intervals[0]![0]).toBeLessThanOrEqual(0)
      expect(intervals[1]![1]).toBeGreaterThanOrEqual(390)
      expect(intervals.some(([left, right]) => left! < 390 && right! > 0)).toBe(true)
    }
    track.scrollLeft = 1600
    fireEvent.scroll(track)
    expect(track.scrollLeft).toBe(0)
  } finally { cleanup() }
})

it('runs at 16px/s, resumes immediately with a 350ms ramp, and clears abandoned touch on outside input', () => {
  vi.useFakeTimers({ toFake: ['performance'] })
  const { track, rail, frame, callbacks, cleanup } = createMotion(false)
  const x = () => Number(gsap.getProperty(rail, 'x'))
  try {
    frame(1000)
    expect(x()).toBe(-16)
    fireEvent.pointerDown(track, { pointerType: 'touch', pointerId: 1, clientX: 180, button: 0 })
    frame(1000)
    expect(x()).toBe(-16)
    fireEvent.pointerUp(window, { pointerType: 'touch', pointerId: 1 })
    vi.advanceTimersByTime(175)
    frame(100)
    expect(x()).toBeCloseTo(-16.8)
    vi.advanceTimersByTime(175)
    frame(100)
    expect(x()).toBeCloseTo(-18.4)
    fireEvent.pointerDown(track, { pointerType: 'touch', pointerId: 2, clientX: 180, button: 0 })
    frame(100)
    expect(x()).toBeCloseTo(-18.4)
    // Missing pointerup must be recoverable without an IntersectionObserver change.
    fireEvent.pointerDown(document.body, { pointerType: 'touch', pointerId: 3, button: 0 })
    expect(track.dataset.dragging).toBe('false')
    expect(callbacks.size).toBe(1)
    vi.advanceTimersByTime(350)
    frame(100)
    expect(x()).toBeCloseTo(-20)
    fireEvent.keyDown(track, { key: 'Tab' })
    fireEvent.focusIn(rail.querySelector('button')!)
    frame(100)
    const focusedX = x()
    frame(100)
    expect(x()).toBe(focusedX)
    fireEvent.pointerDown(document.body, { pointerType: 'touch', pointerId: 4, button: 0 })
    frame(100)
    expect(x()).toBeLessThan(focusedX)
  } finally { cleanup(); vi.useRealTimers() }
})

it('keeps a keyboard-focused control visible after native focus scrolls the viewport', () => {
  const { track, rail, frame, cleanup } = createMotion()
  try {
    track.scrollLeft = 460
    fireEvent.keyDown(track, { key: 'Tab' })
    fireEvent.focusIn(rail.querySelector('button')!)
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-460)
    expect(track.scrollLeft).toBe(0)
  } finally {
    cleanup()
  }
})
