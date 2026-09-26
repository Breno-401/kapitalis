import { useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
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
  const tabRefs = useRef<Partial<Record<DemoFinanceView, HTMLButtonElement>>>({})
  const panelId = `${useId()}-finance-panel`
  const activeTabId = `${panelId}-${activeView}`

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex = currentIndex

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % views.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + views.length) % views.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = views.length - 1
    } else {
      return
    }

    event.preventDefault()
    const nextView = views[nextIndex]!.id
    setActiveView(nextView)
    tabRefs.current[nextView]?.focus()
  }

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
          description="Veja o que começa a ficar claro quando a Kapitalis organiza pagamentos, recebimentos e fechamento."
        />

        <div className={styles.workspace}>
          <div
            className={styles.controls}
          >
            <p className={styles.controlsLabel}>Visualizar rotina</p>
            <div
              className={styles.viewTabs}
              role="tablist"
              aria-label="Vistas da Mesa de Controle"
            >
              {views.map(({ id, label, detail }, index) => (
                <button
                  ref={(element) => {
                    tabRefs.current[id] = element ?? undefined
                  }}
                  id={`${panelId}-${id}`}
                  aria-controls={panelId}
                  aria-selected={activeView === id}
                  tabIndex={activeView === id ? 0 : -1}
                  role="tab"
                  className={styles.viewButton}
                  key={id}
                  onClick={() => setActiveView(id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
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
          </div>

          <FinancialConsole
            view={activeView}
            expanded
            panelId={panelId}
            tabId={activeTabId}
          />
        </div>
      </div>
    </section>
  )
}
