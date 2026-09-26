import { demoFinance } from '../data/demoFinance'
import styles from './FinancialConsole.module.css'

export function FinancialConsole() {
  return (
    <section
      className={styles.console}
      aria-labelledby="financial-console-title"
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rotina financeira</p>
          <h2 id="financial-console-title">Mesa de Controle Financeira</h2>
        </div>
        <span className={styles.signal} aria-hidden="true" />
      </div>

      <p className={styles.notice}>
        <span className={styles.noticeMark} aria-hidden="true" />
        AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS
      </p>

      <div className={styles.weekHeader}>
        <h3>Fluxo da semana</h3>
        <span>{demoFinance.period}</span>
      </div>

      <div className={styles.balance}>
        <p>Saldo projetado</p>
        <p className={styles.balanceValue}>{demoFinance.projectedBalance}</p>
        <p className={styles.balanceNote}>Estimativa ilustrativa até sexta-feira</p>
      </div>

      <dl className={styles.flowValues}>
        <div>
          <dt>Entradas previstas</dt>
          <dd>{demoFinance.inflows}</dd>
        </div>
        <div>
          <dt>Compromissos</dt>
          <dd>− {demoFinance.commitments}</dd>
        </div>
      </dl>

      <ul className={styles.routines} aria-label="Rotinas ilustrativas">
        <li>
          <span className={styles.routineMarker} aria-hidden="true" />
          <span className={styles.routineName}>Próximo vencimento</span>
          <span className={styles.routineDetail}>
            {demoFinance.nextDue.date} · {demoFinance.nextDue.amount}
          </span>
        </li>
        <li>
          <span className={styles.routineMarker} aria-hidden="true" />
          <span className={styles.routineName}>Conciliação bancária</span>
          <span className={styles.routineDetail}>
            {demoFinance.reconciliation}
          </span>
        </li>
        <li>
          <span className={styles.routineMarker} aria-hidden="true" />
          <span className={styles.routineName}>Fechamento do período</span>
          <span className={styles.routineDetail}>{demoFinance.closing}</span>
        </li>
      </ul>
    </section>
  )
}
