import styles from './ReviewsSection.module.css'

export function ReviewNavigation({ onPrevious, onNext }: {
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className={`container ${styles.navigation}`} data-review-navigation>
      <button type="button" className={styles.navigationButton} aria-label="Avaliação anterior" onClick={onPrevious}>
        <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false"><path d="M15.75 10H4.25m5-5-5 5 5 5" /></svg>
      </button>
      <button type="button" className={styles.navigationButton} aria-label="Próxima avaliação" onClick={onNext}>
        <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false"><path d="M4.25 10h11.5m-5-5 5 5-5 5" /></svg>
      </button>
    </div>
  )
}
