import { SectionHeading } from '../components/SectionHeading'
import { services } from '../data/services'
import styles from './ServicesSection.module.css'

const featuredService = services.find(({ id }) => id === 'bpo-financeiro')
const supportingServices = services.filter(
  ({ id }) => id !== 'bpo-financeiro',
)

export function ServicesSection() {
  if (!featuredService) return null

  return (
    <section
      className={styles.section}
      id="servicos"
      aria-labelledby="services-title"
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Serviços</p>
        <SectionHeading
          className={styles.heading}
          id="services-title"
          title="Apoio para a rotina da empresa."
          description="Contabilidade, BPO Financeiro e apoio tributário se encontram em atividades do dia a dia."
        />

        <div className={styles.layout}>
          <article className={styles.featured}>
            <div className={styles.featuredTopline}>
              <span>Rotina financeira</span>
              <span className={styles.featuredMark} aria-hidden="true" />
            </div>
            <h3>{featuredService.title}</h3>
            <p className={styles.featuredDescription}>
              {featuredService.description}
            </p>
            <ul className={styles.featuredActivities}>
              {featuredService.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
            <a className={styles.featuredLink} href="#bpo">
              Ver a Mesa de Controle
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M4.5 10h10m-4-4 4 4-4 4" />
              </svg>
            </a>
          </article>

          <div className={styles.supporting}>
            {supportingServices.map((service, index) => (
              <article className={styles.service} key={service.id}>
                <p className={styles.serviceLabel}>
                  {index === 0 ? 'Base contábil' : 'Apoio especializado'}
                </p>
                <h3>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.activities}>
                  {service.activities.map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
