import { useRef, useSyncExternalStore } from 'react'
import type { GoogleReviewsSnapshot } from '../data/googleReviews'
import { GoogleMark } from '../components/GoogleMark'
import { ReviewCard } from './ReviewCard'
import { ReviewsMobileCarousel } from './ReviewsMobileCarousel'
import { useInfiniteReviewRail } from './useInfiniteReviewRail'
import styles from './ReviewsSection.module.css'

type ReviewsSectionProps = {
  data: GoogleReviewsSnapshot
}

const mobileQuery = '(max-width: 700px)'
const reviewSets = ['primary', 'duplicate'] as const

function subscribeMobileViewport(onChange: () => void) {
  const media = window.matchMedia?.(mobileQuery)
  media?.addEventListener?.('change', onChange)
  return () => media?.removeEventListener?.('change', onChange)
}

function isMobileViewport() {
  return window.matchMedia?.(mobileQuery).matches ?? false
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

export function ReviewsSection({ data }: ReviewsSectionProps) {
  const isMobile = useSyncExternalStore(subscribeMobileViewport, isMobileViewport, () => false)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  useInfiniteReviewRail({
    enabled: !isMobile,
    items: data.reviews,
    trackRef,
    railRef,
  })

  const formattedRating = data.averageRating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const reviewVolume = data.totalReviews > 50
    ? 'Mais de 50 avaliações no Google'
    : `${data.totalReviews} avaliações no Google`

  return (
    <section
      className={styles.section}
      data-theme-surface="dark"
      id="avaliacoes"
      aria-labelledby="reviews-title"
    >
      <div className={`container ${styles.header}`} data-review-header>
        <div className={styles.intro} data-reveal-group>
          <p className={styles.eyebrow} data-reveal="text">Vozes de quem já conhece a Kapitalis</p>
          <h2 id="reviews-title" data-reveal="text" data-reveal-step="1">A confiança aparece em cada avaliação.</h2>
          <p className={styles.description} data-reveal="text" data-reveal-step="2">
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
          data-reveal="text"
          data-reveal-step="2"
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

      {isMobile ? <ReviewsMobileCarousel reviews={data.reviews} /> : (
        <div className={styles.trackFrame} data-review-frame data-reveal="text" data-reveal-step="3">
          <div
            className={styles.track}
            data-review-track
            aria-label="Avaliações de clientes no Google"
            aria-live="off"
            role="region"
            ref={trackRef}
          >
            <div className={styles.trackRail} data-review-rail ref={railRef}>
              {reviewSets.map((set) => (
                <ul
                  className={styles.reviewSet}
                  key={set}
                  data-review-set={set}
                  aria-hidden={set !== 'primary' ? 'true' : undefined}
                  inert={set !== 'primary' || undefined}
                >
                  {data.reviews.map((review) => (
                    <li
                      className={styles.trackItem}
                      key={`${review.id}-${set}`}
                      data-review-card
                      data-review-id={review.id}
                    >
                      <ReviewCard review={review} idPrefix={set !== 'primary' ? `${set}-` : ''} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`container ${styles.closingCta}`} data-review-closing-cta data-reveal="quiet">
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
