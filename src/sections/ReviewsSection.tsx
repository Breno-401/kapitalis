import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { GoogleMark } from '../components/GoogleMark'
import type { GoogleReviewsSnapshot } from '../data/googleReviews'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewsSection.module.css'

type ReviewsSectionProps = {
  data: GoogleReviewsSnapshot
}

type DragState = {
  pointerId: number
  startX: number
  startOffset: number
  moved: boolean
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

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const rail = railRef.current
    if (!section || !track || !rail) return
    const activeTrack = track as HTMLDivElement
    const activeRail = rail as HTMLDivElement

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const compactLayout = window.matchMedia?.('(max-width: 700px)')
    let frame: number | null = null
    let lastTime: number | null = null

    function moveRail(nextOffset: number) {
      const seam = seamRef.current
      const normalized = seam > 0 ? ((nextOffset % seam) + seam) % seam : 0
      offsetRef.current = normalized
      activeRail.style.transform = `translate3d(${-Number(normalized.toFixed(3))}px, 0, 0)`
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
        moveRail(offsetRef.current + elapsed * 0.014)
      }
      lastTime = timestamp
      frame = window.requestAnimationFrame(advance)
    }

    function startAutoplay() {
      if (frame !== null || reducedMotion?.matches || compactLayout?.matches) return
      lastTime = null
      frame = window.requestAnimationFrame(advance)
    }

    function syncLayout() {
      measureSeam()
      if (compactLayout?.matches) {
        stopAutoplay()
        offsetRef.current = 0
        activeRail.style.transform = ''
        activeTrack.scrollLeft = 0
        return
      }

      moveRail(offsetRef.current)
      if (reducedMotion?.matches) stopAutoplay()
      else startAutoplay()
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncLayout)
    resizeObserver?.observe(activeTrack)
    resizeObserver?.observe(activeRail)
    activeRail.querySelectorAll('[data-review-set]').forEach((set) => resizeObserver?.observe(set))
    window.addEventListener('resize', syncLayout)
    reducedMotion?.addEventListener?.('change', syncLayout)
    compactLayout?.addEventListener?.('change', syncLayout)
    syncLayout()

    return () => {
      stopAutoplay()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', syncLayout)
      reducedMotion?.removeEventListener?.('change', syncLayout)
      compactLayout?.removeEventListener?.('change', syncLayout)
    }
  }, [data.reviews])

  function moveBy(direction: -1 | 1) {
    const track = trackRef.current
    const rail = railRef.current
    if (!track || !rail) return

    const isCompact = window.matchMedia?.('(max-width: 700px)').matches ?? false
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const card = rail.querySelector<HTMLElement>('[data-review-card]')
    const distance = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8

    if (isCompact) {
      track.scrollBy({ left: direction * distance, behavior: reducedMotion ? 'auto' : 'smooth' })
      return
    }

    const seam = seamRef.current
    if (seam <= 0) return
    const nextOffset = ((offsetRef.current + direction * distance) % seam + seam) % seam
    offsetRef.current = nextOffset
    rail.style.transform = `translate3d(${-Number(nextOffset.toFixed(3))}px, 0, 0)`
  }

  function keepFocusedCardVisible(target: EventTarget, track: HTMLDivElement) {
    const rail = railRef.current
    if (!rail || (window.matchMedia?.('(max-width: 700px)').matches ?? false)) return
    const card = (target as HTMLElement).closest<HTMLElement>('[data-review-card]')
    if (!card) return

    const trackRect = track.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    if (cardRect.left < trackRect.left) {
      moveBy(-1)
    } else if (cardRect.right > trackRect.right) {
      moveBy(1)
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (window.matchMedia?.('(max-width: 700px)').matches || event.button !== 0) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offsetRef.current,
      moved: false,
    }
    pauseReasonsRef.current.add('drag')
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function continueDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4) {
      drag.moved = true
      event.preventDefault()
      event.currentTarget.dataset.dragging = 'true'
      const rail = railRef.current
      if (!rail || seamRef.current <= 0) return
      const nextOffset = ((drag.startOffset - distance) % seamRef.current + seamRef.current) % seamRef.current
      offsetRef.current = nextOffset
      rail.style.transform = `translate3d(${-Number(nextOffset.toFixed(3))}px, 0, 0)`
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.moved) suppressClickUntilRef.current = Date.now() + 350
    dragRef.current = null
    event.currentTarget.dataset.dragging = 'false'
    pauseReasonsRef.current.delete('drag')
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (Date.now() > suppressClickUntilRef.current) return
    suppressClickUntilRef.current = 0
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <section
      className={styles.section}
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
      <div className={`container ${styles.header}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Vozes de quem já conhece a Kapitalis</p>
          <h2 id="reviews-title">A confiança aparece em cada avaliação.</h2>
          <p className={styles.description}>
            Relatos públicos de pessoas que já confiaram sua rotina à equipe.
          </p>
        </div>

        <div className={styles.aggregate} aria-label="Avaliação no Google">
          <div className={styles.aggregateScore}>
            <span className={styles.score}>{data.averageRating.toFixed(1).replace('.', ',')}</span>
            <span className={styles.aggregateStars} aria-hidden="true">
              ★★★★★
            </span>
          </div>
          <div className={styles.aggregateSource}>
            <GoogleMark />
            <span>{data.totalReviews} avaliações no Google</span>
          </div>
          <a
            className={styles.allReviewsLink}
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver avaliações no Google
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={styles.trackFrame}>
        <div
          className={styles.track}
          data-review-track
          aria-label="Avaliações de clientes no Google"
          aria-live="off"
          role="region"
          ref={trackRef}
          tabIndex={0}
          onPointerEnter={() => pauseReasonsRef.current.add('hover')}
          onPointerLeave={(event) => {
            pauseReasonsRef.current.delete('hover')
            event.currentTarget.dataset.dragging = 'false'
          }}
          onPointerDown={beginDrag}
          onPointerMove={continueDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) endDrag(event)
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
                  <li className={styles.trackItem} key={`${review.id}-${duplicate ? 'duplicate' : 'primary'}`} data-review-card>
                    <ReviewCard review={review} idPrefix={duplicate ? 'duplicate-' : ''} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className={`container ${styles.controls}`}>
        <span className={styles.trackHint}>Arraste para explorar · pausa ao passar o cursor ou focar</span>
        <div className={styles.buttons} aria-label="Controles das avaliações">
          <button type="button" aria-label="Avaliações anteriores" onClick={() => moveBy(-1)}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" aria-label="Próximas avaliações" onClick={() => moveBy(1)}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
