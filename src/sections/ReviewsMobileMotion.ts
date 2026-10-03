import { gsap } from 'gsap'

/**
 * WeEvolveIT's hero reviews (0mc1t21lq~25w.js, component M) use
 * ticker + set + utils.wrap, with pointer events updating only a coordinate.
 * Keep that single-writer model; native pan-y owns vertical touch scrolling.
 */
export function installReviewsMobileMotion(
  section: HTMLElement,
  track: HTMLDivElement,
  rail: HTMLDivElement,
) {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const originalTransform = rail.style.transform
  let position = Number(gsap.getProperty(rail, 'x')) || 0
  let period = 0
  let wrap = gsap.utils.wrap(0, 1)
  let pointerId: number | null = null
  let startX = 0
  let startPosition = 0
  let draggable = false
  let dragging = false
  let hovered = false
  let focused = false
  let keyboardInput = false
  let pendingRender = false
  let resumeAt = 0
  let suppressClickUntil = 0
  let ticking = false
  let visible = typeof IntersectionObserver === 'undefined'
    ? track.getBoundingClientRect().bottom > 0 && track.getBoundingClientRect().top < window.innerHeight
    : false

  function measure() {
    const sets = rail.querySelectorAll<HTMLElement>('[data-review-set]')
    if (sets.length < 2) return
    // Measure the actual repeat period, including Kapitalis's gap and gutters.
    period = sets[1].getBoundingClientRect().left - sets[0].getBoundingClientRect().left
    if (period > 0) wrap = gsap.utils.wrap(0, period)
  }

  function render(_time: number, deltaTime: number) {
    if (period <= 0) return
    if (pointerId === null && !hovered && !focused && !reducedMotion?.matches) {
      const elapsed = performance.now() - resumeAt
      if (elapsed >= 0) {
        // Preserve 8px/s; ease only the restart, without a tween or second writer.
        const restart = resumeAt === 0 ? 1 : Math.min(elapsed / 350, 1)
        position -= deltaTime / 1000 * 8 * restart
      }
    }
    position = -wrap(-position)
    gsap.set(rail, { x: position, force3D: true })
    pendingRender = false
    if (reducedMotion?.matches && pointerId === null) syncTicker()
  }

  function syncTicker() {
    const shouldTick = visible && document.visibilityState !== 'hidden'
      && (!reducedMotion?.matches || pointerId !== null || pendingRender)
    if (shouldTick && !ticking) {
      ticking = true
      gsap.ticker.add(render)
    } else if (!shouldTick && ticking) {
      ticking = false
      gsap.ticker.remove(render)
    }
  }

  function press(event: PointerEvent) {
    if (pointerId !== null || (event.pointerType !== 'touch' && event.button !== 0)) return
    pointerId = event.pointerId
    startX = event.clientX
    startPosition = position
    dragging = false
    draggable = !(event.target instanceof Element
      && event.target.closest('button, a, [role="button"], [data-clickable]'))
    resumeAt = Infinity
    syncTicker()
  }

  function move(event: PointerEvent) {
    if (event.pointerId !== pointerId || !draggable) return
    const distance = event.clientX - startX
    if (!dragging) {
      // The reference's 5px activation, without handcrafted axis arbitration.
      if (Math.abs(distance) < 5) return
      dragging = true
      track.dataset.dragging = 'true'
      try { rail.setPointerCapture(event.pointerId) } catch { /* Global listeners remain available. */ }
    }
    position = startPosition + distance
    pendingRender = true
  }

  function release(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    const wasDragging = dragging
    pointerId = null
    dragging = false
    draggable = false
    track.dataset.dragging = 'false'
    resumeAt = performance.now() + 3000
    if (wasDragging) suppressClickUntil = performance.now() + 350
    try {
      if (rail.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture(event.pointerId)
    } catch { /* The browser may have released the touch during vertical scrolling. */ }
    syncTicker()
  }

  function enter(event: PointerEvent) {
    if (event.pointerType === 'mouse') hovered = true
  }

  function leave(event: PointerEvent) {
    if (event.pointerType === 'mouse') hovered = false
  }

  function focus(event: FocusEvent) {
    const control = event.target
    if (!(control instanceof HTMLElement)) return
    focused = keyboardInput || control.matches(':focus-visible')
    if (!focused) return
    if (!control.closest('[data-review-card]')) return
    // Browsers scroll an overflow:hidden region before dispatching focusin.
    // Reset that native scroll before measuring, so only the rail moves.
    track.scrollLeft = 0
    const viewport = track.getBoundingClientRect()
    const bounds = control.getBoundingClientRect()
    position -= bounds.left < viewport.left ? bounds.left - viewport.left
      : bounds.right > viewport.right ? bounds.right - viewport.right : 0
    pendingRender = true
    syncTicker()
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === 'Tab') keyboardInput = true
  }

  function pointerFocus() {
    keyboardInput = false
    focused = false
  }

  function blur(event: FocusEvent) {
    if (!section.contains(event.relatedTarget as Node | null)) focused = false
  }

  function click(event: MouseEvent) {
    if (performance.now() >= suppressClickUntil) return
    suppressClickUntil = 0
    event.preventDefault()
    event.stopPropagation()
  }

  function visibilityChange() {
    // Never keep an abandoned contact active after switching tabs.
    if (document.visibilityState === 'hidden' && pointerId !== null) {
      release({ pointerId } as PointerEvent)
    }
    syncTicker()
  }

  function fallbackScroll() {
    if (typeof IntersectionObserver !== 'undefined') return
    const bounds = track.getBoundingClientRect()
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight
    syncTicker()
  }

  const intersection = typeof IntersectionObserver === 'undefined' ? null
    : new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false
        syncTicker()
      })
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
  measure()
  resize?.observe(track)
  rail.querySelectorAll('[data-review-set]').forEach(set => resize?.observe(set))
  intersection?.observe(track)
  track.addEventListener('pointerdown', press)
  track.addEventListener('pointerenter', enter)
  track.addEventListener('pointerleave', leave)
  track.addEventListener('click', click, true)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', release)
  window.addEventListener('pointercancel', release)
  window.addEventListener('resize', measure)
  window.addEventListener('scroll', fallbackScroll, { passive: true })
  section.addEventListener('focusin', focus)
  section.addEventListener('focusout', blur)
  section.addEventListener('pointerdown', pointerFocus, true)
  document.addEventListener('keydown', keydown)
  document.addEventListener('visibilitychange', visibilityChange)
  reducedMotion?.addEventListener?.('change', syncTicker)
  syncTicker()

  return () => {
    if (ticking) gsap.ticker.remove(render)
    if (pointerId !== null) {
      try { rail.releasePointerCapture(pointerId) } catch { /* Already released. */ }
    }
    intersection?.disconnect()
    resize?.disconnect()
    track.removeEventListener('pointerdown', press)
    track.removeEventListener('pointerenter', enter)
    track.removeEventListener('pointerleave', leave)
    track.removeEventListener('click', click, true)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', release)
    window.removeEventListener('pointercancel', release)
    window.removeEventListener('resize', measure)
    window.removeEventListener('scroll', fallbackScroll)
    section.removeEventListener('focusin', focus)
    section.removeEventListener('focusout', blur)
    section.removeEventListener('pointerdown', pointerFocus, true)
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('visibilitychange', visibilityChange)
    reducedMotion?.removeEventListener?.('change', syncTicker)
    track.dataset.dragging = 'false'
    // gsap.set owns its cache; revert it before the approved desktop motor takes over.
    gsap.set(rail, { clearProps: 'transform,translate,rotate,scale' })
    rail.style.transform = originalTransform
  }
}
