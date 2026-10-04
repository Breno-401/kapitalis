import { fireEvent } from '@testing-library/react'
import { gsap } from 'gsap'
import { expect, it, vi } from 'vitest'
import { installReviewsMobileMotion } from './ReviewsMobileMotion'

function createMotion(reduced = true, buttonLeft = 800) {
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
  const callbacks = new Set<gsap.TickerCallback>()
  const add = vi.spyOn(gsap.ticker, 'add').mockImplementation(callback => { callbacks.add(callback); return callback })
  const remove = vi.spyOn(gsap.ticker, 'remove').mockImplementation(callback => { callbacks.delete(callback) })
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.tagName === 'BUTTON') {
      const scroll = this.closest('[data-review-track]')!.scrollLeft
      const rail = this.closest('[data-review-track]')!.firstElementChild as HTMLElement
      const x = Number(rail.style.transform.match(/translate(?:3d)?\(([-\d.]+)px/)?.[1] ?? 0)
      return { left: 1016 + buttonLeft + x - scroll, right: 1066 + buttonLeft + x - scroll, width: 50, top: 0, bottom: 30, height: 30 } as DOMRect
    }
    if (this.dataset.reviewTrack !== undefined) return { left: 0, right: 390, width: 390, top: 0, bottom: 400, height: 400 } as DOMRect
    const left = this.dataset.reviewSet === 'primary' ? 1016 : this.dataset.reviewSet === 'next' ? 2032 : 0
    return { left, right: left + 1000, width: 1000, top: 0, bottom: 400, height: 400 } as DOMRect
  })
  const section = document.createElement('section')
  const track = document.createElement('div')
  const rail = document.createElement('div')
  rail.style.columnGap = '16px'
  track.dataset.reviewTrack = ''
  rail.innerHTML = '<ul data-review-set="previous"><li>Review</li></ul><ul data-review-set="primary"><li data-review-card><button>Ler mais</button></li></ul><ul data-review-set="next"><li>Review</li></ul>'
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
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-1076)
    fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 1, clientX: 100 })
    fireEvent.pointerUp(window, { pointerType: 'touch', pointerId: 1 })
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-1096)
    expect(callbacks.size).toBe(0)
    frame()
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-1096)
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
      const intervals = [[x, x + 1000], [x + 1016, x + 2016], [x + 2032, x + 3032]]
      // Only the intentional 16px inter-card gap is allowed, never an empty tail.
      expect(intervals[0]![0]).toBeLessThanOrEqual(0)
      expect(intervals[2]![1]).toBeGreaterThanOrEqual(390)
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
  const x = () => Number(gsap.getProperty(rail, 'x')) + 1016
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
    expect(Number(gsap.getProperty(rail, 'x'))).toBe(-1476)
    expect(track.scrollLeft).toBe(0)
  } finally {
    cleanup()
  }
})

it.each([[320, 812], [375, 812], [390, 844], [402, 874], [430, 932]])(
  'keeps actual card coverage away from both physical ends at %i×%i through extreme reversals', (width, height) => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const ticks = new Set<gsap.TickerCallback>()
    const add = vi.spyOn(gsap.ticker, 'add').mockImplementation(callback => { ticks.add(callback); return callback })
    const remove = vi.spyOn(gsap.ticker, 'remove').mockImplementation(callback => { ticks.delete(callback) })
    const section = document.createElement('section')
    const track = document.createElement('div')
    const rail = document.createElement('div')
    const itemWidth = width - 128, gap = 12, gutter = 20
    const period = 9 * (itemWidth + gap)
    track.dataset.reviewTrack = ''
    for (const name of ['previous', 'primary', 'next']) {
      const set = document.createElement('ul')
      set.dataset.reviewSet = name
      for (let index = 0; index < 9; index++) set.innerHTML += '<li data-review-card><article>Review</article></li>'
      rail.append(set)
    }
    track.append(rail)
    section.append(track)
    document.body.append(section)
    const rects = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this === track) return { left: 0, right: width, width, top: 0, bottom: height, height } as DOMRect
      const x = Number(rail.style.transform.match(/translate(?:3d)?\(([-\d.]+)px/)?.[1] ?? 0)
      const set = this.closest<HTMLElement>('[data-review-set]')
      const setIndex = Array.from(rail.children).indexOf(set!)
      let left = gutter + setIndex * period + x, size = period - gap
      if (this.tagName === 'ARTICLE') {
        const item = this.parentElement!
        left += Array.from(set!.children).indexOf(item) * (itemWidth + gap) + 12
        size = itemWidth - 24
      }
      return { left, right: left + size, width: size, top: 0, bottom: 300, height: 300 } as DOMRect
    })
    const cleanup = installReviewsMobileMotion(section, track, rail)
    const frame = () => { for (const tick of ticks) tick(0, 16, 1, 0) }
    const coverage = () => {
      const cards = Array.from(rail.querySelectorAll('article'), card => card.getBoundingClientRect())
      // Require buffers beyond BOTH viewport edges, not merely modulo equality.
      expect(cards[0]!.left).toBeLessThan(-width)
      expect(cards.at(-1)!.right).toBeGreaterThan(2 * width)
      const visible = cards.filter(card => card.right > 0 && card.left < width)
      expect(visible.length).toBeGreaterThanOrEqual(2)
      let edge = 0
      for (const card of visible) {
        expect(Math.max(0, card.left - edge)).toBeLessThanOrEqual(gap + 24 + 0.01)
        edge = Math.max(edge, card.right)
      }
      expect(Math.max(0, width - edge)).toBeLessThanOrEqual(gap + 24 + 0.01)
    }
    const visibleScene = () => Array.from(rail.querySelectorAll('article')).flatMap(card => {
      const bounds = card.getBoundingClientRect()
      if (bounds.right <= 0 || bounds.left >= width) return []
      return [{ review: Array.from(card.parentElement!.parentElement!.children).indexOf(card.parentElement!), left: Math.round(bounds.left * 1000) / 1000 }]
    })
    try {
      expect(Number(gsap.getProperty(rail, 'x'))).toBeCloseTo(-period)
      const sets = Array.from(rail.children, set => set.getBoundingClientRect())
      expect(sets[1]!.left - sets[0]!.left).toBe(period)
      expect(sets[2]!.left - sets[1]!.left).toBe(period)
      coverage()
      const initialScene = visibleScene()
      fireEvent.pointerDown(track, { pointerType: 'touch', pointerId: 10, clientX: 180, button: 0 })
      for (const multiple of [0.5, 1, 2, 5, 10, 100, -0.5, -1, -2, -5, -10, -100]) {
        fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 10, clientX: 180 + multiple * period })
        frame()
        coverage()
        const x = Number(gsap.getProperty(rail, 'x'))
        expect(x).toBeGreaterThanOrEqual(-2 * period)
        expect(x).toBeLessThanOrEqual(-period)
      }
      let distance = 0
      for (const [direction, count] of [[-1, 20], [1, 40], [-1, 20]] as const) {
        for (let step = 0; step < count; step++) {
          distance += direction * period * 0.37
          fireEvent.pointerMove(window, { pointerType: 'touch', pointerId: 10, clientX: 180 + distance })
          frame()
          coverage()
        }
      }
      expect(visibleScene()).toEqual(initialScene)
    } finally {
      cleanup(); section.remove(); rects.mockRestore(); add.mockRestore(); remove.mockRestore(); vi.unstubAllGlobals()
    }
  },
)

it('keeps a keyboard-focused control at the end of PRIMARY visible inside the central wrap window', () => {
  const { track, rail, frame, cleanup } = createMotion(true, 950)
  try {
    const control = rail.querySelector('button')!
    fireEvent.keyDown(track, { key: 'Tab' })
    fireEvent.focusIn(control)
    frame()
    expect(control.getBoundingClientRect().left).toBeGreaterThanOrEqual(0)
    expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(390)
  } finally { cleanup() }
})
