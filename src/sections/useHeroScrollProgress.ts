import { useEffect, useState, type RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}

function prefersStaticLayout() {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.innerWidth <= 700 ||
      (typeof window.matchMedia === 'function' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.matchMedia('(max-width: 43.75rem)').matches)),
  )
}

export function useHeroScrollProgress(
  experienceRef: ElementRef,
  trackRef: ElementRef,
) {
  const [introHidden, setIntroHidden] = useState(false)
  const [systemVisible, setSystemVisible] = useState(false)
  const [staticLayout, setStaticLayout] = useState(prefersStaticLayout)

  useEffect(() => {
    const experienceNode = experienceRef.current
    const trackNode = trackRef.current
    if (!experienceNode || !trackNode) return
    const experience = experienceNode as HTMLElement
    const track = trackNode as HTMLElement

    let trackStart = 0
    let trackRange = window.innerHeight
    let frame = 0
    let isStatic = staticLayout

    const reducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
    const compactLayout =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 43.75rem)')
        : null

    function getStaticLayout() {
      return Boolean(
        reducedMotion?.matches ||
          compactLayout?.matches ||
          window.innerWidth <= 700,
      )
    }

    function writeProgress(value: number) {
      experience.style.setProperty('--hero-progress', value.toFixed(4))
      experience.style.setProperty('--hero-core-x', `${value * 22}vw`)
      experience.style.setProperty('--hero-core-y', `${(1 - value) * 17}vh`)
      experience.style.setProperty(
        '--hero-core-scale',
        (0.64 + value * 0.36).toFixed(4),
      )
      experience.style.setProperty(
        '--hero-core-opacity',
        (0.34 + value * 0.66).toFixed(4),
      )
      experience.style.setProperty(
        '--hero-core-blur',
        `${(1 - value) * 1.4}px`,
      )
      experience.style.setProperty(
        '--hero-copy-opacity',
        Math.max(0, 1 - value / 0.78).toFixed(4),
      )
      experience.style.setProperty('--hero-copy-y', `${value * -20}px`)
      experience.style.setProperty(
        '--hero-system-opacity',
        Math.max(0, Math.min(1, (value - 0.56) / 0.34)).toFixed(4),
      )
      experience.style.setProperty(
        '--hero-cue-opacity',
        Math.max(0, 1 - value * 1.35).toFixed(4),
      )

      setIntroHidden(!isStatic && value >= 0.78)
      setSystemVisible(isStatic || value >= 0.58)
    }

    function update() {
      frame = 0
      writeProgress(
        isStatic ? 0 : clamp((window.scrollY - trackStart) / trackRange),
      )
    }

    function schedule() {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    function measure() {
      const rect = track.getBoundingClientRect()
      trackStart = rect.top + window.scrollY
      trackRange = Math.max(rect.height, window.innerHeight, 1)

      const nextStatic = getStaticLayout()
      if (nextStatic !== isStatic) {
        isStatic = nextStatic
        setStaticLayout(nextStatic)
        experience.dataset.staticLayout = String(nextStatic)
      }

      schedule()
    }

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure)
    observer?.observe(experienceNode)
    observer?.observe(trackNode)

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    reducedMotion?.addEventListener('change', measure)
    compactLayout?.addEventListener('change', measure)

    measure()
    void document.fonts?.ready.then(measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      reducedMotion?.removeEventListener('change', measure)
      compactLayout?.removeEventListener('change', measure)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [experienceRef, staticLayout, trackRef])

  return { introHidden, systemVisible, staticLayout }
}
