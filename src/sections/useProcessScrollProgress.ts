import { useEffect, useState, type RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>
const staticQuery = '(max-width: 360px)'

function prefersStaticLayout() {
  return typeof window !== 'undefined' && (
    window.innerWidth <= 360 ||
    (typeof window.matchMedia === 'function' && window.matchMedia(staticQuery).matches)
  )
}

export function useProcessScrollProgress(trackRef: ElementRef, sceneRef: ElementRef, count: number) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [staticLayout, setStaticLayout] = useState(prefersStaticLayout)

  useEffect(() => {
    const track = trackRef.current
    const scene = sceneRef.current
    if (!track || !scene) return

    const media = typeof window.matchMedia === 'function' ? window.matchMedia(staticQuery) : null
    let start = 0
    let range = 1
    let isStatic = prefersStaticLayout()
    let frame = 0
    let disposed = false
    let currentIndex = -1

    function update() {
      frame = 0
      if (disposed) return
      const progress = isStatic ? 0 : Math.max(0, Math.min(1, (window.scrollY - start) / range))
      const nextIndex = Math.min(count - 1, Math.floor(progress * count))
      if (nextIndex !== currentIndex) {
        currentIndex = nextIndex
        setActiveIndex(nextIndex)
      }
      // The final stage occupies the last scroll interval, with the line already complete.
      track!.style.setProperty('--process-progress', Math.min(1, progress * count / (count - 1)).toFixed(4))
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    function measure() {
      if (disposed) return
      isStatic = prefersStaticLayout()
      setStaticLayout(isStatic)
      const rect = track!.getBoundingClientRect()
      const inset = Number.parseFloat(window.getComputedStyle(scene!).top) || 0
      const trackStyle = window.getComputedStyle(track!)
      const paddingTop = Number.parseFloat(trackStyle.paddingTop) || 0
      const paddingBottom = Number.parseFloat(trackStyle.paddingBottom) || 0
      start = rect.top + window.scrollY + paddingTop - inset
      // The scroll range starts when the scene reaches its sticky top inset and ends
      // when it meets the track's bottom edge. Include that inset in the travel distance.
      range = Math.max(
        1,
        rect.height - paddingTop - paddingBottom - scene!.getBoundingClientRect().height + inset,
      )
      update()
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    media?.addEventListener('change', measure)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    observer?.observe(track)
    observer?.observe(scene)
    if (track.parentElement) observer?.observe(track.parentElement)
    document.fonts?.ready.then(measure)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      media?.removeEventListener('change', measure)
      observer?.disconnect()
    }
  }, [count, trackRef, sceneRef])

  return { activeIndex, staticLayout }
}
