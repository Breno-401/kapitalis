import { site } from '../data/site'
import styles from './FinalCtaSection.module.css'

export function FinalCtaSection() {
  return (
    <section
      className={styles.section}
      data-theme-surface="dark"
      aria-labelledby="final-cta-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Próximo passo</p>
          <h2 id="final-cta-title">Vamos conversar sobre a rotina da sua empresa.</h2>
          <p>
            Conte à equipe o que está acontecendo no dia a dia da empresa.
          </p>
          <a
            aria-label="Conversar no WhatsApp (abre em nova aba)"
            className={styles.action}
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar no WhatsApp
            <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
              <path d="M4.5 10h10m-4-4 4 4-4 4" />
            </svg>
          </a>
        </div>
        <div className={styles.portrait} aria-hidden="true">
          <img src="/images/next-step-person.png" alt="" />
        </div>
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </section>
  )
}
