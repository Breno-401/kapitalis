import { useId, useRef, useState, type KeyboardEvent } from 'react'
import styles from './ProcessSection.module.css'

const steps = [
  {
    title: 'Entender a operação',
    description: 'Conhecer o contexto e a rotina atual da empresa.',
  },
  {
    title: 'Organizar os dados',
    description: 'Reunir e estruturar as informações disponíveis.',
  },
  {
    title: 'Assumir as rotinas',
    description: 'Organizar o calendário financeiro e contábil.',
  },
  {
    title: 'Entregar informação',
    description: 'Consolidar movimentos em uma leitura mais clara.',
  },
  {
    title: 'Acompanhar decisões',
    description: 'Usar essa leitura como apoio para os próximos passos.',
  },
] as const

export function ProcessSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const sectionId = useId()
  const activeStep = steps[activeIndex]!
  const activeTabId = `${sectionId}-tab-${activeIndex}`
  const panelId = `${sectionId}-panel`
  const nextStep = steps[activeIndex + 1]

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (index + 1) % steps.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (index - 1 + steps.length) % steps.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = steps.length - 1
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
      id="processo"
      aria-labelledby="process-title"
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Etapas conceituais</p>
        <div className={styles.heading}>
          <h2 id="process-title">Como uma rotina pode se organizar.</h2>
          <p>
            Uma sequência de referência para pensar o caminho entre conhecer a
            operação e acompanhar decisões.
          </p>
        </div>

        <div className={styles.route}>
          <div
            className={styles.steps}
            role="tablist"
            aria-label="Etapas conceituais do processo"
            aria-orientation="vertical"
          >
            {steps.map(({ title }, index) => (
              <button
                aria-controls={panelId}
                aria-label={title}
                aria-selected={index === activeIndex}
                className={styles.step}
                id={`${sectionId}-tab-${index}`}
                key={title}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                role="tab"
                tabIndex={index === activeIndex ? 0 : -1}
                type="button"
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.stepTitle}>{title}</span>
                <span className={styles.stepMark} aria-hidden="true" />
              </button>
            ))}
          </div>

          <article
            aria-labelledby={`${activeTabId}-heading`}
            className={styles.panel}
            id={panelId}
            key={activeIndex}
            role="tabpanel"
            tabIndex={0}
          >
            <div className={styles.panelTopline}>
              <span>ETAPA ATUAL</span>
              <span aria-hidden="true">
                {String(activeIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
              </span>
            </div>
            <div className={styles.panelContent} aria-live="polite">
              <span className={styles.panelNumber} aria-hidden="true">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <h3 id={`${activeTabId}-heading`}>{activeStep.title}</h3>
              <p>{activeStep.description}</p>
            </div>
            <div className={styles.progressTrack}>
              <progress
                aria-label="Progresso da sequência"
                className={styles.progress}
                max={steps.length}
                value={activeIndex + 1}
              />
              <span>
                {nextStep ? `A seguir · ${nextStep.title}` : 'Etapa final da sequência'}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
