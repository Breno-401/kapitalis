import type { ReactNode } from 'react'
import styles from './FinancialToolShell.module.css'

export function FinancialToolShell({
  title,
  headingId,
  ariaLabel,
  left,
  right,
  leftClassName,
  rightClassName,
  footerClassName,
  stableHeight = false,
}: {
  title?: string
  headingId: string
  ariaLabel?: string
  left: ReactNode
  right: ReactNode
  leftClassName?: string
  rightClassName?: string
  footerClassName?: string
  stableHeight?: boolean
}) {
  return (
    <section className={styles.shell} aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : headingId}>
      {title && <div className={styles.header}><h2 id={headingId}>{title}</h2></div>}
      <div className={styles.columns} data-stable-height={stableHeight || undefined}>
        <div className={`${styles.inputs} ${leftClassName ?? ''}`} data-financial-inputs>{left}</div>
        <div className={`${styles.dashboard} ${rightClassName ?? ''}`}>{right}</div>
      </div>
      <div className={`${styles.footer} ${footerClassName ?? ''}`} data-financial-footer>
        <SpecialistCTA />
      </div>
    </section>
  )
}

export function SpecialistCTA() {
  return (
    <div className={styles.expertCta}>
      <span>Precisa avaliar seu caso com mais detalhe?</span>
      <a href="https://wa.me/5527998829289" target="_blank" rel="noopener noreferrer">
        Falar com um especialista →
      </a>
    </div>
  )
}
