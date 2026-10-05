import { useEffect, type RefObject } from 'react'

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

/** Runs a measured, infinite review rail and pauses only while the mouse is over it. */
export function useInfiniteReviewRail({
  enabled,
  items,
  trackRef,
  railRef,
  speed = 24,
}: InfiniteReviewRailOptions) {
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
      if (lastTime !== null && !isHovered) {
        const elapsed = Math.min(timestamp - lastTime, 80)
        moveRail(offset.current + (elapsed * speed) / 1000)
      }
      lastTime = timestamp
      frame = window.requestAnimationFrame(advance)
    }

    function startAutoplay() {
      if (frame !== null || !isVisible || !pageVisible || reducedMotion?.matches || isHovered) return
      lastTime = null
      frame = window.requestAnimationFrame(advance)
    }

    function syncLayout() {
      measureSeam()
      if (!hasIntersectionObserver) isVisible = isTrackInViewport(track)
      moveRail(offset.current)
      if (reducedMotion?.matches) stopAutoplay()
      else startAutoplay()
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
      stopAutoplay()
    }

    function handleMouseLeave() {
      isHovered = false
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
}
