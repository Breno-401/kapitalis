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
        <div className={styles.topline}>
          <p className={styles.eyebrow}>Próximo passo</p>
          <svg
            aria-hidden="true"
            className={styles.systemTrace}
            viewBox="0 0 360 56"
            fill="none"
            focusable="false"
          >
            <path d="M1 28h138l24-18h80l20 18h96" />
            <circle cx="139" cy="28" r="3" />
            <circle cx="163" cy="10" r="3" />
            <circle cx="243" cy="10" r="3" />
            <circle cx="263" cy="28" r="3" />
            <circle cx="359" cy="28" r="3" />
          </svg>
        </div>
        <div className={styles.content}>
          <div>
            <h2 id="final-cta-title">Vamos conversar sobre a rotina da sua empresa.</h2>
            <p>
              Conte à equipe o que está acontecendo no dia a dia da empresa.
            </p>
          </div>
          <a
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
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </section>
  )
}
