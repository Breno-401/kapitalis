import { useRef } from 'react'
import { GoogleMark } from '../components/GoogleMark'
import type { GoogleReviewsSnapshot } from '../data/googleReviews'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewsSection.module.css'

type ReviewsSectionProps = {
  data: GoogleReviewsSnapshot
}

export function ReviewsSection({ data }: ReviewsSectionProps) {
  const trackRef = useRef<HTMLUListElement>(null)

  function scrollTrack(direction: -1 | 1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-review-card]')
    const distance = card ? card.offsetWidth + 24 : track.clientWidth * 0.8
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    track.scrollBy({ left: direction * distance, behavior })
  }

  return (
    <section
      className={styles.section}
      id="avaliacoes"
      aria-labelledby="reviews-title"
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
        <ul
          className={styles.track}
          aria-label="Avaliações de clientes no Google"
          ref={trackRef}
          tabIndex={0}
        >
          {data.reviews.map((review) => (
            <li className={styles.trackItem} key={review.id} data-review-card>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      </div>

      <div className={`container ${styles.controls}`}>
        <span className={styles.trackHint}>Deslize para ler mais relatos</span>
        <div className={styles.buttons} aria-label="Controles das avaliações">
          <button
            type="button"
            aria-label="Avaliações anteriores"
            onClick={() => scrollTrack(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Próximas avaliações"
            onClick={() => scrollTrack(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
