import { site } from '../data/site'
import { FinancialConsole } from '../components/FinancialConsole'
import styles from './HeroSection.module.css'

export function HeroSection() {
  return (
    <section
      className={styles.hero}
      id="inicio"
      aria-labelledby="hero-title"
    >
      <div className={`container ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span aria-hidden="true" />
            Contabilidade &amp; BPO Financeiro · {site.locality}
          </p>
          <h1 className={styles.title} id="hero-title">
            Seus números sob controle.
            <span>
              Suas decisões com <em>mais clareza.</em>
            </span>
          </h1>
          <p className={styles.description}>
            A Kapitalis organiza a rotina contábil e financeira para você acompanhar o negócio com mais clareza.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.primaryAction}
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conversar com a Kapitalis
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M4.5 10h10m-4-4 4 4-4 4" />
              </svg>
            </a>
            <a className={styles.secondaryAction} href="#sistema">
              Conhecer o sistema Kapitalis
            </a>
          </div>
        </div>
        <FinancialConsole />
      </div>
    </section>
  )
}
