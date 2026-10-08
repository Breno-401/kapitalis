import { useEffect, useMemo, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import type { GoogleReview } from '../data/googleReviews'
import { ReviewCard } from './ReviewCard'
import { ReviewNavigation } from './ReviewNavigation'
import styles from './ReviewsSection.module.css'

export function ReviewsMobileCarousel({ reviews }: { reviews: readonly GoogleReview[] }) {
  const plugins = useMemo(() => [AutoScroll({
    speed: 0.32,
    startDelay: 0,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false,
    playOnInit: false,
    breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
  })], [])
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    watchDrag: false,
    containScroll: false,
    align: 'start',
    container: '[data-review-rail]',
  }, plugins)
  const navigating = useRef(false)

  useEffect(() => {
    if (!emblaApi) return
    const autoScroll = emblaApi.plugins().autoScroll
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    function resume() {
      if (!motion?.matches && !navigating.current) autoScroll?.play()
    }
    function settle() {
      if (!navigating.current) return
      navigating.current = false
      resume()
    }
    function reInit() {
      // A resize rebuilds Embla at its selected snap, completing pending navigation.
      navigating.current = false
      resume()
    }
    function motionChange() {
      if (motion?.matches) autoScroll?.stop()
      else resume()
    }
    emblaApi.on('settle', settle)
    emblaApi.on('reInit', reInit)
    motion?.addEventListener?.('change', motionChange)
    resume()
    return () => {
      emblaApi.off('settle', settle)
      emblaApi.off('reInit', reInit)
      motion?.removeEventListener?.('change', motionChange)
      autoScroll?.stop()
      navigating.current = false
    }
  }, [emblaApi])

  function navigate(direction: 'previous' | 'next') {
    if (!emblaApi) return
    // stop() cancels the plugin's pending start and restores Embla's scroll body.
    emblaApi.plugins().autoScroll?.stop()
    navigating.current = true
    const jump = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (direction === 'previous') emblaApi.scrollPrev(jump)
    else emblaApi.scrollNext(jump)
  }

  return (
    <>
    <ReviewNavigation onPrevious={() => navigate('previous')} onNext={() => navigate('next')} />
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
    </>
  )
}
