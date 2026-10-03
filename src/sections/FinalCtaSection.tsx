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
        <div className={styles.content} data-reveal-group>
          <p className={styles.eyebrow} data-reveal="text">Próximo passo</p>
          <h2 id="final-cta-title" data-reveal="text" data-reveal-step="1">Vamos conversar sobre a rotina da sua empresa.</h2>
          <p data-reveal="text" data-reveal-step="2">
            Conte à equipe o que está acontecendo no dia a dia da empresa.
          </p>
          <a
            aria-label="Conversar no WhatsApp (abre em nova aba)"
            className={styles.action}
            data-reveal="text"
            data-reveal-step="3"
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
        <div className={styles.portrait} aria-hidden="true" data-reveal="media" data-reveal-step="2">
          <img src="/images/next-step-person.png" alt="" width="658" height="766" loading="lazy" decoding="async" />
        </div>
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </section>
  )
}
