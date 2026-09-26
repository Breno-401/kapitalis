import { site } from '../data/site'
import styles from './FinalCtaSection.module.css'

export function FinalCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-title">
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Próxima conversa</p>
        <div className={styles.content}>
          <div>
            <h2 id="final-cta-title">
              Mais clareza pode começar pela rotina de hoje.
            </h2>
            <p>
              Conte à Kapitalis o que sua empresa precisa organizar e converse
              diretamente com a equipe.
            </p>
          </div>
          <a
            className={styles.action}
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar com a Kapitalis
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
