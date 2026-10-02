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
      {title && <div className={styles.header} data-reveal="text"><h2 id={headingId}>{title}</h2></div>}
      <div className={styles.columns} data-stable-height={stableHeight || undefined}>
        <div className={`${styles.inputs} ${leftClassName ?? ''}`} data-financial-inputs data-reveal="text" data-reveal-step="1">{left}</div>
        <div className={`${styles.dashboard} ${rightClassName ?? ''}`} data-reveal="text" data-reveal-step="2">{right}</div>
      </div>
      <div className={`${styles.footer} ${footerClassName ?? ''}`} data-financial-footer data-reveal="quiet">
        <SpecialistCTA />
      </div>
    </section>
  )
}

export function SpecialistCTA() {
  return (
    <div className={styles.expertCta}>
      <span>Precisa avaliar seu caso com mais detalhe?</span>
      <a aria-label="Falar com um especialista (abre em nova aba)" href="https://wa.me/5527998829289" target="_blank" rel="noopener noreferrer">
        Falar com um especialista →
      </a>
    </div>
  )
}
