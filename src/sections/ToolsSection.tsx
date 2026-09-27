import { useId } from 'react'
import { TaxSimulator } from '../calculators/taxSimulator/TaxSimulator'
import { ComplementarySimulator } from '../calculators/complementary/ComplementarySimulator'
import styles from './ToolsSection.module.css'

export function ToolsSection() {
  const ids = useId()
  const taxHeadingId = `${ids}-tax-heading`
  const complementaryHeadingId = `${ids}-complementary-heading`

  return (
    <section className={styles.section} id="conteudo" aria-label="Simuladores financeiros Kapitalis">
      <div className={`container ${styles.inner}`}>
        <TaxSimulator headingId={taxHeadingId} />

        <section className={styles.complementary} aria-labelledby={complementaryHeadingId}>
          <div className={styles.heading}>
            <h2 id={complementaryHeadingId}>Ferramentas Complementares</h2>
            <p>Simule situações comuns da rotina empresarial.</p>
          </div>
          <ComplementarySimulator headingId={complementaryHeadingId} />
        </section>

        <div className={styles.nextSection}>
          <span className={styles.nextNode} aria-hidden="true" />
          <span className={styles.nextLabel}>Na sequência</span>
          <a href="#processo">Conhecer as etapas do processo</a>
        </div>
      </div>
    </section>
  )
}
