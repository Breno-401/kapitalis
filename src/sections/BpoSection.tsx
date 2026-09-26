import { useState } from 'react'
import { FinancialConsole } from '../components/FinancialConsole'
import { SectionHeading } from '../components/SectionHeading'
import type { DemoFinanceView } from '../data/demoFinance'
import styles from './BpoSection.module.css'

const views: {
  id: DemoFinanceView
  label: string
  detail: string
}[] = [
  { id: 'payments', label: 'Pagamentos', detail: 'Prazos e compromissos' },
  { id: 'receipts', label: 'Recebimentos', detail: 'Entradas previstas' },
  { id: 'closing', label: 'Fechamento', detail: 'Leitura do período' },
]

export function BpoSection() {
  const [activeView, setActiveView] = useState<DemoFinanceView>('payments')

  return (
    <section
      className={styles.section}
      id="bpo"
      aria-labelledby="bpo-title"
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>BPO Financeiro</p>
        <SectionHeading
          className={styles.heading}
          id="bpo-title"
          title="Uma mesa de controle para a rotina financeira."
          description="Alterne entre pagamentos, recebimentos e fechamento para acompanhar como as rotinas podem ser organizadas."
        />

        <div className={styles.workspace}>
          <div
            className={styles.controls}
            role="group"
            aria-label="Vistas da Mesa de Controle"
          >
            <p className={styles.controlsLabel}>Visualizar rotina</p>
            {views.map(({ id, label, detail }) => (
              <button
                aria-label={label}
                aria-pressed={activeView === id}
                className={styles.viewButton}
                key={id}
                onClick={() => setActiveView(id)}
                type="button"
              >
                <span className={styles.buttonIndicator} aria-hidden="true" />
                <span className={styles.buttonText}>
                  <span>{label}</span>
                  <span className={styles.buttonDetail} aria-hidden="true">
                    {detail}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <FinancialConsole view={activeView} expanded />
        </div>
      </div>
    </section>
  )
}
