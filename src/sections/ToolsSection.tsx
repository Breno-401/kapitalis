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
          <div className={styles.heading} data-reveal-group>
            <h2 id={complementaryHeadingId} data-reveal="text">Ferramentas Complementares</h2>
            <p data-reveal="text" data-reveal-step="1">Simule situações comuns da rotina empresarial.</p>
          </div>
          <ComplementarySimulator headingId={complementaryHeadingId} />
        </section>

      </div>
    </section>
  )
}
