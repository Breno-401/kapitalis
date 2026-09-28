import { useId, useState, type FocusEvent, type MouseEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { services } from '../data/services'
import styles from './ServicesSection.module.css'

type Service = (typeof services)[number]

function ServiceIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 40 40" fill="none">
        <rect x="5.5" y="8.5" width="29" height="23" rx="3.5" />
        <path d="M6 15h28M12 24h6m-6 4h12" />
        <circle cx="28" cy="24" r="2" />
      </svg>
    )
  }

  if (index === 1) {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 40 40" fill="none">
        <path d="M8 33V12.5L20 6l12 6.5V33M5 33h30M15 16h3m4 0h3m-10 6h3m4 0h3m-10 6h3m4 0h3" />
        <path d="M18 33v-4h4v4" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 40 40" fill="none">
      <path d="M7 33V7m0 26h27M12 27l6-7 5 4 9-12" />
      <path d="M26 12h6v6" />
      <circle cx="12" cy="27" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <circle cx="23" cy="24" r="1.5" />
    </svg>
  )
}

function ServiceFlipCard({ service, index }: { service: Service; index: number }) {
  const [pointerActive, setPointerActive] = useState(false)
  const [focusActive, setFocusActive] = useState(false)
  const [tapSelected, setTapSelected] = useState(false)
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const backId = `${id}-back`
  const isOpen = pointerActive || focusActive || tapSelected

  function handlePointerEnter(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'touch') setPointerActive(true)
  }

  function handleFocus(event: FocusEvent<HTMLElement>) {
    if (event.target instanceof HTMLElement) setFocusActive(true)
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusActive(false)
    }
  }

  function handleToggle() {
    setTapSelected((current) => !current)
  }

  function handleClose(event: MouseEvent<HTMLButtonElement>) {
    setTapSelected(false)
    if (event.detail > 0) event.currentTarget.blur()
  }

  return (
    <article
      aria-labelledby={titleId}
      className={styles.serviceCard}
      data-open={isOpen}
      onBlurCapture={handleBlur}
      onFocusCapture={handleFocus}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setPointerActive(false)}
    >
      <div className={styles.cardFaces}>
        <div className={styles.frontFace}>
          <button
            aria-controls={backId}
            aria-describedby={descriptionId}
            aria-expanded={isOpen}
            className={styles.frontTrigger}
            onClick={handleToggle}
            type="button"
          >
            <ServiceIcon index={index} />
            <span className={styles.frontLabel}>{service.label}</span>
            <span className={styles.frontTitle} id={titleId} role="heading" aria-level={3}>
              {service.title}
            </span>
            <span className={styles.frontDescription} id={descriptionId}>
              {service.description}
            </span>
            <span aria-hidden="true" className={styles.frontHint}>
              Conheça o serviço
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M5 15 15 5M7 5h8v8" />
              </svg>
            </span>
          </button>
        </div>

        <div
          aria-hidden={!isOpen}
          className={styles.backFace}
          id={backId}
          inert={!isOpen}
        >
          <div className={styles.backHeader}>
            <span className={styles.backLabel}>{service.label}</span>
            <button
              aria-label={`Voltar para ${service.title}`}
              className={styles.closeButton}
              onClick={handleClose}
              tabIndex={isOpen ? 0 : -1}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M15.5 10h-11m4 4-4-4 4-4" />
              </svg>
            </button>
          </div>

          <div className={styles.backContent}>
            <h3>{service.title}</h3>
            <p className={styles.backDescription}>{service.description}</p>
            <ul className={styles.activities}>
              {service.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>

          <a className={styles.serviceLink} href={service.href} tabIndex={isOpen ? 0 : -1}>
            {service.cta}
            <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
              <path d="M4.5 10h10m-4-4 4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}

export function ServicesSection() {
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

        <div className={styles.serviceGrid}>
          {services.map((service, index) => (
            <ServiceFlipCard key={service.id} index={index} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
