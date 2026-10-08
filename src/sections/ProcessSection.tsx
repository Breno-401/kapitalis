import { useId, useRef, useState, type KeyboardEvent } from 'react'
import styles from './ProcessSection.module.css'

const steps = [
  {
    title: 'CONHECER O SEU NEGÓCIO',
    description: 'Antes de cuidar da contabilidade, entendemos como sua empresa funciona, quais são suas necessidades e quais desafios fazem parte da sua rotina.',
    result: 'Uma contabilidade que conhece o seu negócio de verdade.',
    points: [[18, 22], [112, 18], [64, 70], [146, 98], [26, 132]],
  },
  {
    title: 'ORGANIZAR A EMPRESA',
    description: 'Organizamos as informações contábeis, fiscais, trabalhistas e tributárias para que sua empresa tenha uma base segura para seguir em frente.',
    result: 'Mais organização, segurança e tranquilidade para manter sua empresa em dia.',
    points: [[28, 32], [80, 32], [132, 32], [54, 112], [106, 112]],
  },
  {
    title: 'CUIDAR DAS OBRIGAÇÕES',
    description: 'Acompanhamos de perto as rotinas contábeis, fiscais e trabalhistas, cuidando das apurações e das obrigações necessárias para manter sua empresa regularizada.',
    result: 'A tranquilidade de saber que sua empresa está sendo acompanhada.',
    points: [[24, 80], [52, 80], [80, 80], [108, 80], [136, 80]],
  },
  {
    title: 'ANALISAR OS NÚMEROS',
    description: 'A contabilidade não precisa ser apenas uma obrigação. Analisamos as informações da sua empresa para ajudar você a compreender resultados, custos, impostos e o desempenho do negócio.',
    result: 'Clareza para entender o que os números realmente dizem sobre sua empresa.',
    points: [[24, 28], [24, 80], [24, 132], [84, 80], [140, 80]],
  },
  {
    title: 'ORIENTAR SUAS DECISÕES',
    description: 'Com informações organizadas e uma visão completa do negócio, ajudamos você a identificar oportunidades, antecipar necessidades e planejar os próximos passos.',
    result: 'Mais segurança para decidir hoje e planejar o crescimento de amanhã.',
    points: [[24, 124], [52, 98], [80, 72], [108, 46], [136, 20]],
  },
] as const

export function ProcessSection() {
  const sectionId = useId()
  const [activeIndex, setActiveIndex] = useState(0)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight': nextIndex = (index + 1) % steps.length; break
      case 'ArrowLeft': nextIndex = (index + steps.length - 1) % steps.length; break
      case 'Home': nextIndex = 0; break
      case 'End': nextIndex = steps.length - 1; break
      default: return
    }
    event.preventDefault()
    setActiveIndex(nextIndex)
    buttonsRef.current[nextIndex]?.focus({ preventScroll: true })
  }

  return (
    <section
      className={styles.section}
      data-theme-surface="dark"
      id="processo"
      aria-labelledby="process-title"
    >
      <div className={`container ${styles.scene}`}>
        <header data-reveal-group role="presentation">
          <p className={styles.eyebrow} data-reveal="text">Etapas conceituais</p>
          <div className={styles.heading}>
            <h2 id="process-title" data-reveal="text" data-reveal-step="1">Como uma rotina pode se organizar.</h2>
            <p data-reveal="text" data-reveal-step="2">
              Uma sequência de referência para pensar o caminho entre conhecer a
              operação e acompanhar decisões.
            </p>
          </div>
        </header>

        <div className={styles.route}>
          <div className={styles.timeline} role="tablist" aria-label="Etapas conceituais do processo">
            {steps.map(({ title }, index) => (
              <button
                type="button"
                role="tab"
                id={`${sectionId}-${index}-tab`}
                aria-selected={index === activeIndex}
                aria-controls={`${sectionId}-${index}-panel`}
                tabIndex={index === activeIndex ? 0 : -1}
                ref={button => { buttonsRef.current[index] = button }}
                onClick={() => setActiveIndex(index)}
                onKeyDown={event => handleKeyDown(event, index)}
                className={styles.step}
                data-active={index === activeIndex}
                key={title}
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{title}</span>
              </button>
            ))}
          </div>

          <div className={styles.chapters}>
            {steps.map(({ title, description, result, points }, index) => (
              <article
                role="tabpanel"
                id={`${sectionId}-${index}-panel`}
                aria-labelledby={`${sectionId}-${index}-tab`}
                hidden={index !== activeIndex}
                tabIndex={0}
                className={styles.chapter}
                data-active={index === activeIndex}
                key={title}
              >
                <span className={styles.chapterNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.copy}>
                  <h3 id={`${sectionId}-${index}-heading`}>{title}</h3>
                  <p className={styles.description}>{description}</p>
                  <div className={styles.result}>
                    <p className={styles.resultLabel}>O QUE VOCÊ PASSA A TER</p>
                    <p>{result}</p>
                  </div>
                  <p className={styles.counter} aria-label={`Etapa ${index + 1} de ${steps.length}`}>
                    {String(index + 1).padStart(2, '0')} / 05
                  </p>
                </div>
                <svg className={styles.microvisual} viewBox="0 0 160 160" aria-hidden="true">
                  {index === 1 && <path d="M28 32H132M54 112H106" />}
                  {index === 2 && <path d="M24 80H136" />}
                  {index === 3 && <path d="M24 28L84 80L24 132M24 80H140" />}
                  {index === 4 && <path d="M24 124L136 20M112 20H136V44" />}
                  {points.map(([cx, cy]) => <circle cx={cx} cy={cy} r="3" key={`${cx}-${cy}`} />)}
                </svg>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
