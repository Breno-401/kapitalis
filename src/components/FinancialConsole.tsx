import { useId } from 'react'
import {
  DEMO_FINANCE_STATE,
  type DemoFinanceView,
} from '../data/demoFinance'
import styles from './FinancialConsole.module.css'

type FinancialConsoleProps = {
  view?: DemoFinanceView
  expanded?: boolean
}

export function FinancialConsole({
  view,
  expanded = false,
}: FinancialConsoleProps) {
  const titleId = useId()
  const selectedView = view ? DEMO_FINANCE_STATE.views[view] : null
  const { overview, period } = DEMO_FINANCE_STATE

  return (
    <section
      className={`${styles.console} ${expanded ? styles.expanded : ''}`}
      aria-labelledby={titleId}
      data-whatsapp-avoid
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rotina financeira</p>
          <h2 id={titleId}>Mesa de Controle Financeira</h2>
        </div>
        <span className={styles.signal} aria-hidden="true" />
      </div>

      <p className={styles.notice}>
        <span className={styles.noticeMark} aria-hidden="true" />
        AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS
      </p>

      {selectedView ? (
        <div className={styles.interactivePanel}>
          <div className={styles.viewSummary}>
            <div>
              <p className={styles.viewSummaryLabel}>
                {selectedView.summaryLabel}
              </p>
              <p className={styles.viewSummaryValue}>
                {selectedView.summaryValue}
              </p>
              <p className={styles.viewSummaryNote}>
                {selectedView.summaryNote}
              </p>
            </div>
            <div className={styles.viewPeriod}>
              <span>PERÍODO</span>
              <strong>{period}</strong>
            </div>
          </div>

          <div className={styles.recordsHeader}>
            <h3>{selectedView.title}</h3>
            <p>{selectedView.panelStatus}</p>
          </div>

          <ul
            className={styles.viewRecords}
            aria-label={`${selectedView.title} demonstrativos`}
          >
            {selectedView.records.map((record) => (
              <li className={styles.viewRecord} key={record.id}>
                <span className={styles.recordDescription}>
                  <strong>{record.title}</strong>
                  <small>{record.detail}</small>
                </span>
                <strong className={styles.recordAmount}>{record.amount}</strong>
                <span
                  className={styles.statusBadge}
                  data-tone={record.tone}
                >
                  {record.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className={styles.weekHeader}>
            <h3>Fluxo da semana</h3>
            <span>{period}</span>
          </div>

          <div className={styles.balance}>
            <p>Saldo projetado</p>
            <p className={styles.balanceValue}>
              {overview.projectedBalance}
            </p>
            <p className={styles.balanceNote}>
              Estimativa ilustrativa até sexta-feira
            </p>
          </div>

          <dl className={styles.flowValues}>
            <div>
              <dt>Entradas previstas</dt>
              <dd>{overview.inflows}</dd>
            </div>
            <div>
              <dt>Compromissos</dt>
              <dd>− {overview.commitments}</dd>
            </div>
          </dl>

          <ul className={styles.routines} aria-label="Rotinas ilustrativas">
            {overview.routines.map((routine) => (
              <li key={routine.id}>
                <span className={styles.routineMarker} aria-hidden="true" />
                <span className={styles.routineName}>{routine.label}</span>
                <span className={styles.routineDetail}>{routine.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
