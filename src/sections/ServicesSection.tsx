import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { services } from '../data/services'
import styles from './ServicesSection.module.css'

export function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const sectionId = useId()
  const activeService = services[activeIndex]!
  const activeTabId = `${sectionId}-tab-${activeIndex}`
  const panelId = `${sectionId}-panel`

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (index + 1) % services.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (index - 1 + services.length) % services.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = services.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    setActiveIndex(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

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

        <div className={styles.switcher}>
          <div
            className={styles.serviceTabs}
            role="tablist"
            aria-label="Escolha um pilar de serviço"
            aria-orientation="vertical"
          >
            {services.map((service, index) => (
              <button
                aria-controls={panelId}
                aria-selected={index === activeIndex}
                className={styles.serviceTab}
                id={`${sectionId}-tab-${index}`}
                key={service.id}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                role="tab"
                tabIndex={index === activeIndex ? 0 : -1}
                type="button"
              >
                <span className={styles.tabIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.tabText}>
                  <span className={styles.tabLabel}>{service.label}</span>
                  <span className={styles.tabTitle}>{service.title}</span>
                </span>
                <span className={styles.tabMark} aria-hidden="true" />
              </button>
            ))}
          </div>

          <article
            aria-labelledby={`${activeTabId}-heading`}
            className={styles.servicePanel}
            id={panelId}
            key={activeService.id}
            role="tabpanel"
            tabIndex={0}
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>{activeService.label}</span>
              <span className={styles.panelIndex} aria-hidden="true">
                0{activeIndex + 1} / 0{services.length}
              </span>
            </div>

            <div className={styles.panelContent} aria-live="polite">
              <h3 id={`${activeTabId}-heading`}>{activeService.title}</h3>
              <p className={styles.serviceDescription}>{activeService.description}</p>
              <ol className={styles.activities}>
                {activeService.activities.map((activity, index) => (
                  <li key={activity}>
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {activity}
                  </li>
                ))}
              </ol>
            </div>

            <a className={styles.serviceLink} href={activeService.href}>
              {activeService.cta}
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M4.5 10h10m-4-4 4 4-4 4" />
              </svg>
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
