import { useEffect, useRef, type RefObject } from 'react'

type InfiniteReviewRailOptions = {
  enabled: boolean
  items: readonly unknown[]
  trackRef: RefObject<HTMLDivElement | null>
  railRef: RefObject<HTMLDivElement | null>
  speed?: number
}

function isTrackInViewport(track: HTMLElement) {
  const rect = track.getBoundingClientRect()
  const width = window.innerWidth || document.documentElement.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight
  return rect.bottom > 0 && rect.right > 0 && rect.top < height && rect.left < width
}

function setRailOffset(
  rail: HTMLDivElement,
  offset: { current: number },
  seam: { current: number },
  nextOffset: number,
) {
  const period = seam.current
  // The duplicated review set keeps the rail visually continuous at each loop seam.
  const normalized = period > 0 ? ((nextOffset % period) + period) % period : 0
  offset.current = normalized
  rail.style.transform = `translate3d(${-Number(normalized.toFixed(3))}px, 0, 0)`
}

/** One position and animation loop drive both continuous motion and manual navigation. */
export function useInfiniteReviewRail({
  enabled,
  items,
  trackRef,
  railRef,
  speed = 24,
}: InfiniteReviewRailOptions) {
  const navigateRef = useRef<(direction: number) => void>(() => {})
  useEffect(() => {
    if (!enabled) return
    const trackNode = trackRef.current
    const railNode = railRef.current
    if (!trackNode || !railNode) return
    const track: HTMLDivElement = trackNode
    const rail: HTMLDivElement = railNode

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined'
    let frame: number | null = null
    let lastTime: number | null = null
    let isVisible = hasIntersectionObserver ? false : isTrackInViewport(track)
    let pageVisible = document.visibilityState !== 'hidden'
    let isHovered = false
    const offset = { current: 0 }
    const seam = { current: 0 }
    let manual: { from: number; distance: number; start: number | null; progress: number } | null = null

    function moveRail(nextOffset: number) {
      setRailOffset(rail, offset, seam, nextOffset)
    }

    function measureSeam() {
      const sets = rail.querySelectorAll<HTMLElement>('[data-review-set]')
      if (sets.length < 2) return
      const [primary, duplicate] = Array.from(sets)
      seam.current = duplicate!.getBoundingClientRect().left - primary!.getBoundingClientRect().left
      if (seam.current > 0) moveRail(offset.current)
    }

    function stopAutoplay() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
        frame = null
      }
      lastTime = null
    }

    function advance(timestamp: number) {
      frame = null
      if (manual) {
        manual.start ??= timestamp
        const progress = Math.min(1, (timestamp - manual.start) / 320)
        manual.progress = 1 - (1 - progress) ** 3
        moveRail(manual.from + manual.distance * manual.progress)
        if (progress === 1) manual = null
      } else if (lastTime !== null && !isHovered) {
        const elapsed = Math.min(timestamp - lastTime, 80)
        moveRail(offset.current + (elapsed * speed) / 1000)
      }
      lastTime = timestamp
      startAutoplay()
    }

    function startAutoplay() {
      if (frame !== null || !pageVisible) return
      if (!manual && (!isVisible || reducedMotion?.matches || isHovered)) return
      frame = window.requestAnimationFrame(advance)
    }

    navigateRef.current = direction => {
      measureSeam()
      const cards = rail.querySelectorAll<HTMLElement>('[data-review-set="primary"] [data-review-card]')
      if (cards.length < 2 || seam.current <= 0) return
      const step = cards[1]!.getBoundingClientRect().left - cards[0]!.getBoundingClientRect().left
      if (step <= 0) return
      const remaining = manual ? manual.distance * (1 - manual.progress) : 0
      stopAutoplay()
      if (reducedMotion?.matches) {
        manual = null
        moveRail(offset.current + remaining + direction * step)
        return
      }
      // Rapid clicks retarget the same animation, retaining every requested card step.
      manual = { from: offset.current, distance: remaining + direction * step, start: null, progress: 0 }
      startAutoplay()
    }

    function syncLayout() {
      measureSeam()
      if (!hasIntersectionObserver) isVisible = isTrackInViewport(track)
      moveRail(offset.current)
      if (reducedMotion?.matches) {
        stopAutoplay()
        if (manual) moveRail(manual.from + manual.distance)
        manual = null
      }
      startAutoplay()
    }

    function handleVisibilityChange() {
      pageVisible = document.visibilityState !== 'hidden'
      if (!hasIntersectionObserver && pageVisible) isVisible = isTrackInViewport(track)
      if (pageVisible) startAutoplay()
      else stopAutoplay()
    }

    function handleFallbackScroll() {
      if (hasIntersectionObserver) return
      isVisible = isTrackInViewport(track)
      if (isVisible) startAutoplay()
      else stopAutoplay()
    }

    function handleMouseEnter() {
      isHovered = true
      if (!manual) stopAutoplay()
    }

    function handleMouseLeave() {
      isHovered = false
      if (!manual) lastTime = null
      startAutoplay()
    }

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncLayout)
    const intersectionObserver = !hasIntersectionObserver
      ? null
      : new IntersectionObserver(([entry]) => {
          isVisible = entry?.isIntersecting ?? false
          if (isVisible && pageVisible) startAutoplay()
          else stopAutoplay()
        })

    resizeObserver?.observe(track)
    resizeObserver?.observe(rail)
    rail.querySelectorAll('[data-review-set]').forEach((set) => resizeObserver?.observe(set))
    intersectionObserver?.observe(track)
    track.addEventListener('mouseenter', handleMouseEnter)
    track.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', syncLayout)
    window.addEventListener('scroll', handleFallbackScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotion?.addEventListener?.('change', syncLayout)
    syncLayout()

    return () => {
      navigateRef.current = () => {}
      stopAutoplay()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      track.removeEventListener('mouseenter', handleMouseEnter)
      track.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', syncLayout)
      window.removeEventListener('scroll', handleFallbackScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotion?.removeEventListener?.('change', syncLayout)
    }
  }, [enabled, items, railRef, speed, trackRef])
  return {
    previous: () => navigateRef.current(-1),
    next: () => navigateRef.current(1),
  }
}
