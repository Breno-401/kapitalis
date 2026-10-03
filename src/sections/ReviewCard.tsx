import { useState } from 'react'
import { GoogleMark } from '../components/GoogleMark'
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
  expanded,
  onToggle,
  buttonTabIndex,
}: {
  review: GoogleReview
  idPrefix?: string
  expanded?: boolean
  onToggle?: () => void
  buttonTabIndex?: number
}) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const isExpanded = expanded ?? localExpanded
  const [hasAvatarError, setHasAvatarError] = useState(false)
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
      data-expanded={isExpanded}
    >
      <div className={styles.cardTopline}>
        <span className={styles.googleLabel}>
          <GoogleMark />
          <span>Google Reviews</span>
        </span>
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
          tabIndex={buttonTabIndex}
          onClick={onToggle ?? (() => setLocalExpanded((value) => !value))}
        >
          {isExpanded ? 'Recolher' : 'Ler mais'}
        </button>
      ) : null}

      <div className={styles.cardFooter}>
        {review.avatarUrl && !hasAvatarError ? (
          <img
            alt={`Foto de ${review.author}`}
            className={styles.reviewerAvatar}
            decoding="async"
            height={72}
            loading="lazy"
            onError={() => setHasAvatarError(true)}
            src={review.avatarUrl}
            width={72}
          />
        ) : (
          <span className={styles.initials} aria-hidden="true">
            {initials(review.author)}
          </span>
        )}
        <div className={styles.reviewer}>
          <span className={styles.author}>{review.author}</span>
          <span className={styles.period}>{review.period}</span>
        </div>
      </div>
    </article>
  )
}
