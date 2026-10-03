import { fireEvent } from '@testing-library/react'
import { gsap } from 'gsap'
import { expect, it, vi } from 'vitest'
import { installReviewsMobileMotion } from './ReviewsMobileMotion'

function createMotion() {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
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
  track.dataset.reviewTrack = ''
  rail.innerHTML = '<ul data-review-set="primary"><li data-review-card><button>Ler mais</button></li></ul><ul data-review-set="duplicate"><li>Review</li></ul>'
  track.append(rail)
  section.append(track)
  document.body.append(section)
  const cleanup = installReviewsMobileMotion(section, track, rail)
  const frame = () => { for (const callback of callbacks) callback(0, 16, 1, 0) }
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
