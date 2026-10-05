import { useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import type { GoogleReview } from '../data/googleReviews'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewsSection.module.css'

export function ReviewsMobileCarousel({ reviews }: { reviews: readonly GoogleReview[] }) {
  const plugins = useMemo(() => [AutoScroll({
    speed: 0.32,
    startDelay: 0,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false,
    breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
  })], [])
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    watchDrag: false,
    containScroll: false,
    align: 'start',
    container: '[data-review-rail]',
  }, plugins)

  return (
    <div
      className={styles.trackFrame}
      data-review-frame
      data-reveal="text"
      data-reveal-step="3"
      data-review-track
      data-review-mobile
      aria-label="Avaliações de clientes no Google"
      aria-live="off"
      role="region"
      ref={emblaRef}
    >
      <div className={styles.track} data-review-layout>
        <ul className={`${styles.trackRail} ${styles.mobileRail}`} data-review-rail>
          {reviews.map(review => (
            <li className={styles.trackItem} key={review.id} data-review-card data-review-id={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
