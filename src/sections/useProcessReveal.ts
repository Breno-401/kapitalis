import { useEffect, useLayoutEffect, type RefObject } from 'react'

export function useProcessReveal(
  trackRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  staticLayout: boolean,
) {
  useLayoutEffect(() => {
    const chapters = trackRef.current?.querySelectorAll('article')
    if (!chapters) return
    if (staticLayout) {
      chapters.forEach(chapter => {
        chapter.removeAttribute('data-motion')
        chapter.removeAttribute('data-motion-wait')
      })
      return
    }
    const chapter = chapters[activeIndex]
    if (!chapter) return
    function enter() {
      chapter!.removeAttribute('data-motion-wait')
      // Alternating names restarts arrivals without cancelling an outgoing chapter's animation.
      chapter!.dataset.motion = chapter!.dataset.motion === 'a' ? 'b' : 'a'
    }

    const rect = chapter.getBoundingClientRect()
    if ((rect.top < window.innerHeight && rect.bottom > 0) || typeof IntersectionObserver !== 'function') {
      enter()
      return
    }
    let observer: IntersectionObserver | null = null
    let disposed = false
    try {
      observer = new IntersectionObserver(entries => {
        if (disposed) return
        if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.2)) return
        enter()
        observer?.disconnect()
      }, { threshold: 0.2 })
      chapter.dataset.motionWait = ''
      observer.observe(chapter)
    } catch {
      observer?.disconnect()
      enter()
    }
    return () => {
      disposed = true
      observer?.disconnect()
    }
  }, [activeIndex, staticLayout, trackRef])

  useEffect(() => {
    if (!staticLayout) return
    const chapters = trackRef.current?.querySelectorAll('article')
    if (!chapters) return
    const reducedMotion = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    let observer: IntersectionObserver | null = null

    function reset() {
      observer?.disconnect()
      observer = null
      chapters!.forEach(chapter => chapter.removeAttribute('data-viewport-reveal'))
    }

    function observe() {
      reset()
      if (reducedMotion?.matches || typeof IntersectionObserver !== 'function') return
      try {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return
            const chapter = entry.target as HTMLElement
            if (chapter.dataset.viewportReveal === 'pending') chapter.dataset.viewportReveal = 'visible'
            observer?.unobserve(chapter)
          })
        }, { threshold: 0.2 })
        chapters!.forEach(chapter => {
          // Never hide content already in view when preferences or layout change.
          if (chapter.getBoundingClientRect().top >= window.innerHeight) {
            chapter.dataset.viewportReveal = 'pending'
          }
          observer!.observe(chapter)
        })
      } catch {
        reset()
      }
    }

    observe()
    reducedMotion?.addEventListener('change', observe)
    return () => {
      reset()
      reducedMotion?.removeEventListener('change', observe)
    }
  }, [staticLayout, trackRef])
}
