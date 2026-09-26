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
      </div>
    </section>
  )
}
