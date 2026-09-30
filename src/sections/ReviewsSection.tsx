import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { GoogleReviewsSnapshot } from '../data/googleReviews'
import { GoogleMark } from '../components/GoogleMark'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewsSection.module.css'

type ReviewsSectionProps = {
  data: GoogleReviewsSnapshot
}

type DragState = {
  pointerId: number
  startX: number
  startY: number
  startOffset: number
  axis?: 'horizontal' | 'vertical'
  moved: boolean
}

function GoogleProfileArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M4.25 10h11.5m-5-5 5 5-5 5" />
    </svg>
  )
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className={styles.proofStars} role="img" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg aria-hidden="true" key={index} viewBox="0 0 24 24" focusable="false">
          <path d="m12 2.7 2.83 5.74 6.34.92-4.59 4.47 1.08 6.31L12 17.16l-5.66 2.98 1.08-6.31L2.83 9.36l6.34-.92L12 2.7Z" />
        </svg>
      ))}
    </span>
  )
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
  const normalized = period > 0 ? ((nextOffset % period) + period) % period : 0
  offset.current = normalized
  rail.style.transform = `translate3d(${-Number(normalized.toFixed(3))}px, 0, 0)`
}

export function ReviewsSection({ data }: ReviewsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const seamRef = useRef(0)
  const pauseReasonsRef = useRef(new Set<string>())
  const dragRef = useRef<DragState | null>(null)
  const suppressClickUntilRef = useRef(0)

  const formattedRating = data.averageRating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const reviewVolume =
    data.totalReviews > 50
      ? 'Mais de 50 avaliações no Google'
      : `${data.totalReviews} avaliações no Google`

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const rail = railRef.current
    if (!section || !track || !rail) return
    const activeTrack = track as HTMLDivElement
    const activeRail = rail as HTMLDivElement

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined'
    let frame: number | null = null
    let lastTime: number | null = null
    let isVisible = hasIntersectionObserver ? false : isTrackInViewport(activeTrack)
    let pageVisible = document.visibilityState !== 'hidden'

    function moveRail(nextOffset: number) {
      setRailOffset(activeRail, offsetRef, seamRef, nextOffset)
    }

    function measureSeam() {
      const sets = activeRail.querySelectorAll<HTMLElement>('[data-review-set]')
      if (sets.length < 2) return
      const [primary, duplicate] = Array.from(sets)
      seamRef.current = duplicate!.getBoundingClientRect().left - primary!.getBoundingClientRect().left
      if (seamRef.current > 0) moveRail(offsetRef.current)
    }

    function stopAutoplay() {
      if (frame === null) return
      window.cancelAnimationFrame(frame)
      frame = null
      lastTime = null
    }

    function advance(timestamp: number) {
      if (lastTime !== null && pauseReasonsRef.current.size === 0 && !dragRef.current) {
        const elapsed = Math.min(timestamp - lastTime, 80)
        moveRail(offsetRef.current + (elapsed * seamRef.current) / 50_000)
      }
      lastTime = timestamp
      frame = window.requestAnimationFrame(advance)
    }

    function startAutoplay() {
      if (frame !== null || !isVisible || !pageVisible || reducedMotion?.matches) return
      lastTime = null
      frame = window.requestAnimationFrame(advance)
    }

    function syncLayout() {
      measureSeam()
      if (!hasIntersectionObserver) isVisible = isTrackInViewport(activeTrack)
      moveRail(offsetRef.current)
      if (reducedMotion?.matches) stopAutoplay()
      else startAutoplay()
    }

    function handleVisibilityChange() {
      pageVisible = document.visibilityState !== 'hidden'
      if (!hasIntersectionObserver && pageVisible) {
        isVisible = isTrackInViewport(activeTrack)
      }
      if (pageVisible) startAutoplay()
      else stopAutoplay()
    }

    function handleFallbackScroll() {
      if (hasIntersectionObserver) return
      isVisible = isTrackInViewport(activeTrack)
      if (isVisible) startAutoplay()
      else stopAutoplay()
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncLayout)
    const intersectionObserver =
      !hasIntersectionObserver
        ? null
        : new IntersectionObserver(([entry]) => {
            isVisible = entry?.isIntersecting ?? false
            if (isVisible && pageVisible) startAutoplay()
            else stopAutoplay()
          })
    resizeObserver?.observe(activeTrack)
    resizeObserver?.observe(activeRail)
    activeRail.querySelectorAll('[data-review-set]').forEach((set) => resizeObserver?.observe(set))
    intersectionObserver?.observe(activeTrack)
    window.addEventListener('resize', syncLayout)
    window.addEventListener('scroll', handleFallbackScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotion?.addEventListener?.('change', syncLayout)
    syncLayout()

    return () => {
      stopAutoplay()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener('resize', syncLayout)
      window.removeEventListener('scroll', handleFallbackScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotion?.removeEventListener?.('change', syncLayout)
    }
  }, [data.reviews])

  function keepFocusedCardVisible(target: EventTarget, track: HTMLDivElement) {
    const rail = railRef.current
    const focusedControl = target as HTMLElement
    if (!rail || !focusedControl.closest('[data-review-card]')) return

    const trackRect = track.getBoundingClientRect()
    const controlRect = focusedControl.getBoundingClientRect()
    const offsetAdjustment =
      controlRect.left < trackRect.left
        ? controlRect.left - trackRect.left
        : controlRect.right > trackRect.right
          ? controlRect.right - trackRect.right
          : 0
    if (offsetAdjustment !== 0 && seamRef.current > 0) {
      setRailOffset(rail, offsetRef, seamRef, offsetRef.current + offsetAdjustment)
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch' && event.button !== 0) return
    if (dragRef.current) return
    if (
      event.target instanceof Element &&
      event.target.closest('button, a, [role="button"], [data-clickable]')
    ) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offsetRef.current,
      moved: false,
    }
    pauseReasonsRef.current.add('drag')
  }

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current
      const track = trackRef.current
      const rail = railRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      if (drag.axis === 'vertical') return

      const distance = event.clientX - drag.startX
      const verticalDistance = event.clientY - drag.startY
      if (drag.axis === undefined) {
        if (Math.max(Math.abs(distance), Math.abs(verticalDistance)) <= 5) return
        drag.axis = Math.abs(verticalDistance) > Math.abs(distance) ? 'vertical' : 'horizontal'
        if (drag.axis === 'vertical') {
          pauseReasonsRef.current.delete('drag')
          return
        }
      }

      if (!drag.moved) {
        try {
          track?.setPointerCapture(event.pointerId)
        } catch {
          // Pointer capture is optional; window listeners keep dragging available.
        }
      }
      drag.moved = true
      event.preventDefault()
      if (track) track.dataset.dragging = 'true'
      if (!rail || seamRef.current <= 0) return

      const nextOffset = ((drag.startOffset - distance) % seamRef.current + seamRef.current) % seamRef.current
      offsetRef.current = nextOffset
      rail.style.transform = `translate3d(${-Number(nextOffset.toFixed(3))}px, 0, 0)`
    }

    const finish = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return

      if (drag.moved) suppressClickUntilRef.current = Date.now() + 350
      dragRef.current = null
      const track = trackRef.current
      if (track) {
        track.dataset.dragging = 'false'
        try {
          if (track.hasPointerCapture?.(event.pointerId)) {
            track.releasePointerCapture?.(event.pointerId)
          }
        } catch {
          // The pointer may already have been released by the browser.
        }
      }
      pauseReasonsRef.current.delete('drag')
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [])

  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (Date.now() > suppressClickUntilRef.current) return
    suppressClickUntilRef.current = 0
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <section
      className={styles.section}
      data-theme-surface="dark"
      id="avaliacoes"
      aria-labelledby="reviews-title"
      ref={sectionRef}
      onFocusCapture={(event) => {
        pauseReasonsRef.current.add('focus')
        const track = trackRef.current
        if (track) keepFocusedCardVisible(event.target, track)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pauseReasonsRef.current.delete('focus')
        }
      }}
    >
      <div className={`container ${styles.header}`} data-review-header>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Vozes de quem já conhece a Kapitalis</p>
          <h2 id="reviews-title">A confiança aparece em cada avaliação.</h2>
          <p className={styles.description}>
            Relatos públicos de pessoas que já confiaram sua rotina à equipe.
          </p>
        </div>
        <a
          className={styles.proofCard}
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Google, nota ${formattedRating} de 5 estrelas. ${reviewVolume}. Ver avaliações no Google (abre em nova aba)`}
          data-review-proof
          data-google-profile-link="summary"
        >
          <span className={styles.proofMetric}>
            <span className={styles.proofBrand}>
              <span aria-hidden="true"><GoogleMark /></span>
              <span>Google</span>
            </span>
            <strong>{formattedRating}</strong>
            <ReviewStars rating={data.averageRating} />
          </span>
          <span className={styles.proofDetails}>
            <span className={styles.reviewVolume}>{reviewVolume}</span>
            <span className={styles.proofAction}>Ver avaliações no Google</span>
          </span>
          <span className={styles.proofArrow}><GoogleProfileArrow /></span>
        </a>
      </div>

      <div className={styles.trackFrame} data-review-frame>
        <div
          className={styles.track}
          data-review-track
          aria-label="Avaliações de clientes no Google"
          aria-live="off"
          role="region"
          ref={trackRef}
          tabIndex={0}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') pauseReasonsRef.current.add('hover')
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'touch') pauseReasonsRef.current.delete('hover')
            if (!dragRef.current?.moved) event.currentTarget.dataset.dragging = 'false'
          }}
          onPointerDown={beginDrag}
          onLostPointerCapture={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) {
              const drag = dragRef.current
              if (drag.moved) suppressClickUntilRef.current = Date.now() + 350
              dragRef.current = null
              event.currentTarget.dataset.dragging = 'false'
              pauseReasonsRef.current.delete('drag')
            }
          }}
          onClickCapture={handleClickCapture}
        >
          <div className={styles.trackRail} data-review-rail ref={railRef}>
            {[false, true].map((duplicate) => (
              <ul
                className={styles.reviewSet}
                key={duplicate ? 'duplicate' : 'primary'}
                data-review-set={duplicate ? 'duplicate' : 'primary'}
                aria-hidden={duplicate ? 'true' : undefined}
                inert={duplicate || undefined}
              >
                {data.reviews.map((review) => (
                  <li
                    className={styles.trackItem}
                    key={`${review.id}-${duplicate ? 'duplicate' : 'primary'}`}
                    data-review-card
                  >
                    <ReviewCard review={review} idPrefix={duplicate ? 'duplicate-' : ''} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className={`container ${styles.closingCta}`} data-review-closing-cta>
        <a
          className={styles.closingLink}
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver todas no Google (abre em nova aba)"
          data-google-profile-link="closing"
        >
          <span>Ver todas no Google</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
            <path d="M11 4h5v5M16 4 8 12M13 12v4H4V7h4" />
          </svg>
        </a>
      </div>
    </section>
  )
}
