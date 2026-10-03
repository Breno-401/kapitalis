import { useId } from 'react'
import {
  DEMO_FINANCE_STATE,
  type DemoFinanceView,
} from '../data/demoFinance'
import styles from './FinancialConsole.module.css'

type FinancialConsoleProps = {
  view?: DemoFinanceView
  expanded?: boolean
  panelId?: string
  tabId?: string
}

export function FinancialConsole({
  view,
  expanded = false,
  panelId,
  tabId,
}: FinancialConsoleProps) {
  const titleId = useId()
  const selectedView = view ? DEMO_FINANCE_STATE.views[view] : null
  const { overview, period } = DEMO_FINANCE_STATE

  return (
    <section
      className={`${styles.console} ${expanded ? styles.expanded : ''}`}
      aria-labelledby={titleId}
      data-whatsapp-avoid
      {...(selectedView && panelId && tabId
        ? { id: panelId, role: 'tabpanel' as const, 'aria-labelledby': tabId, tabIndex: 0 }
        : {})}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rotina financeira</p>
          <h2 id={titleId}>Mesa de Controle Financeira</h2>
        </div>
        {expanded ? (
          <p className={styles.notice} role="status">
            <span className={styles.noticeMark} aria-hidden="true" />
            <span className={styles.noticeTitle} aria-hidden="true">
              Demonstração
            </span>
            <span className={styles.noticeSeparator} aria-hidden="true">·</span>
            <span className={styles.noticeDetail} aria-hidden="true">
              Dados fictícios
            </span>
            <span className={styles.noticeAccessibleLabel}>
              AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS
            </span>
          </p>
        ) : (
          <span className={styles.signal} aria-hidden="true" />
        )}
      </div>

      {!expanded ? (
        <p className={styles.notice}>
          <span className={styles.noticeMark} aria-hidden="true" />
          AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS
        </p>
      ) : null}

      {selectedView ? (
        <div className={styles.interactivePanel}>
          <div className={styles.panelToolbar}>
            <span className={styles.panelStatusMark} aria-hidden="true" />
            <span>Rotina da semana</span>
            <span className={styles.panelToolbarPeriod}>{period}</span>
          </div>

          <div
            className={styles.viewBody}
            data-demo-view={view}
            key={view}
          >
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

            <dl
              className={styles.metricStrip}
              aria-label={`Indicadores demonstrativos: ${selectedView.title}`}
            >
              {selectedView.metrics.map((metric) => (
                <div className={styles.metric} data-tone={metric.tone} key={metric.id}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                  <span>{metric.note}</span>
                </div>
              ))}
            </dl>

            <div className={styles.recordsHeader}>
              <div>
                <h3>{selectedView.title}</h3>
                <p>{selectedView.panelStatus}</p>
              </div>
              <span className={styles.timelineHint}>LINHA DO PERÍODO</span>
            </div>

            <ol
              className={styles.viewRecords}
              aria-label={selectedView.timelineLabel}
            >
              {selectedView.records.map((record) => (
                <li className={styles.viewRecord} data-tone={record.tone} key={record.id}>
                  <span className={styles.recordDate}>{record.date}</span>
                  <span className={styles.recordPath} aria-hidden="true">
                    <span className={styles.recordMarker} />
                  </span>
                  <span className={styles.recordDescription}>
                    <strong>{record.title}</strong>
                    <small>{record.detail}</small>
                  </span>
                  <span className={styles.recordAmount}>{record.amount}</span>
                  <span className={styles.statusBadge} data-tone={record.tone}>
                    {record.status}
                  </span>
                </li>
              ))}
            </ol>
          </div>
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
