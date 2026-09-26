import { site } from '../data/site'
import styles from './TrustStrip.module.css'

const services = ['Contabilidade', 'BPO Financeiro']

export function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Atuação e localidade">
      <div className={`container ${styles.inner}`}>
        <ul className={styles.facts}>
          {services.map((service) => (
            <li key={service}>{service}</li>
          ))}
          <li>{site.locality}</li>
        </ul>
        <a
          className={styles.reviewsLink}
          href={site.googleReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver avaliações no Google
          <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
            <path d="M4.5 10h10m-4-4 4 4-4 4" />
          </svg>
        </a>
      </div>
    </section>
  )
}
