import { useEffect, useRef } from 'react'
import styles from './SectionTransition.module.css'

export function SectionTransition() {
  const markerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      marker.dataset.visible = 'true'
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      marker.dataset.visible = 'true'
      observer.unobserve(marker)
    }, { rootMargin: '0px 0px -8% 0px' })

    observer.observe(marker)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden="true"
      className={styles.transition}
      data-section-transition
      data-visible="false"
      ref={markerRef}
    >
      <span data-transition-pulse="left" />
      <span data-transition-pulse="right" />
    </div>
  )
}
