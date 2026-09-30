import { useEffect, type RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>

const maxOffset = 6

function clamp(value: number) {
  return Math.max(-maxOffset, Math.min(maxOffset, value))
}

export function useHeroAtmospherePointer(experienceRef: ElementRef) {
  useEffect(() => {
    const experienceNode = experienceRef.current
    if (!experienceNode || typeof window.matchMedia !== 'function') return
    const experience: HTMLElement = experienceNode

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame: number | null = null
    let pointerListening = false
    let offsetX = 0
    let offsetY = 0

    function clearOffset() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
        frame = null
      }
      experience.style.removeProperty('--hero-atmosphere-x')
      experience.style.removeProperty('--hero-atmosphere-y')
    }

    function writeOffset() {
      frame = null
      if (!finePointer.matches || reducedMotion.matches) return
      experience.style.setProperty('--hero-atmosphere-x', `${offsetX.toFixed(2)}px`)
      experience.style.setProperty('--hero-atmosphere-y', `${offsetY.toFixed(2)}px`)
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return

      offsetX = clamp((event.clientX / Math.max(window.innerWidth, 1) - 0.5) * maxOffset * 2)
      offsetY = clamp((event.clientY / Math.max(window.innerHeight, 1) - 0.5) * maxOffset * 2)
      if (frame === null) frame = window.requestAnimationFrame(writeOffset)
    }

    function syncPointerPreference() {
      const enabled = finePointer.matches && !reducedMotion.matches
      if (enabled && !pointerListening) {
        experience.addEventListener('pointermove', handlePointerMove, { passive: true })
        pointerListening = true
      } else if (!enabled) {
        if (pointerListening) {
          experience.removeEventListener('pointermove', handlePointerMove)
          pointerListening = false
        }
        clearOffset()
      }
    }

    finePointer.addEventListener('change', syncPointerPreference)
    reducedMotion.addEventListener('change', syncPointerPreference)
    syncPointerPreference()

    return () => {
      finePointer.removeEventListener('change', syncPointerPreference)
      reducedMotion.removeEventListener('change', syncPointerPreference)
      if (pointerListening) {
        experience.removeEventListener('pointermove', handlePointerMove)
      }
      clearOffset()
    }
  }, [experienceRef])
}
