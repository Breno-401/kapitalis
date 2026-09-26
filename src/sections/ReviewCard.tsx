import { useState } from 'react'
import type { GoogleReview } from '../data/googleReviews'
import styles from './ReviewsSection.module.css'

const previewLimit = 158

function initials(author: string) {
  return author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('pt-BR')
}

export function ReviewCard({
  review,
  idPrefix = '',
}: {
  review: GoogleReview
  idPrefix?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = review.text.length > previewLimit
  const displayedText =
    isLong && !isExpanded
      ? `${review.text.slice(0, previewLimit).trimEnd()}…`
      : review.text
  const reviewTextId = `${idPrefix}review-text-${review.id}`

  return (
    <article
      className={styles.reviewCard}
      aria-label={`Avaliação de ${review.author}`}
    >
      <div className={styles.cardTopline}>
        <span className={styles.googleLabel}>Google Reviews</span>
        <span className={styles.stars}>
          <span aria-hidden="true">★★★★★</span>
          <span className={styles.visuallyHidden}>
            {review.rating} de 5 estrelas
          </span>
        </span>
      </div>

      <blockquote className={styles.quote}>
        <p id={reviewTextId}>{displayedText}</p>
      </blockquote>

      {isLong ? (
        <button
          className={styles.expandButton}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={reviewTextId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded
            ? 'Recolher avaliação'
            : `Ler avaliação completa de ${review.author}`}
        </button>
      ) : null}

      <div className={styles.cardFooter}>
        <span className={styles.initials} aria-hidden="true">
          {initials(review.author)}
        </span>
        <div className={styles.reviewer}>
          <span className={styles.author}>{review.author}</span>
          <span className={styles.period}>{review.period}</span>
        </div>
        <a
          className={styles.sourceLink}
          href={review.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver avaliação de ${review.author} no Google`}
        >
          ↗
        </a>
      </div>
    </article>
  )
}
