import styles from './SectionTransition.module.css'

export function SectionTransition() {
  return (
    <div
      aria-hidden="true"
      className={styles.transition}
      data-section-transition
    />
  )
}
