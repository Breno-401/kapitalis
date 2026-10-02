import { useId, useRef } from 'react'
import { useProcessScrollProgress } from './useProcessScrollProgress'
import { useProcessReveal } from './useProcessReveal'
import styles from './ProcessSection.module.css'

const steps = [
  {
    title: 'Entender a operação',
    description: 'Entender como informações, pagamentos, recebimentos e responsabilidades circulam hoje.',
    result: 'Uma visão clara de como a rotina funciona atualmente.',
    points: [[18, 22], [112, 18], [64, 70], [146, 98], [26, 132]],
  },
  {
    title: 'Organizar os dados',
    description: 'Reunir as informações necessárias e criar uma base organizada para o acompanhamento.',
    result: 'Informações financeiras reunidas e estruturadas.',
    points: [[28, 32], [80, 32], [132, 32], [54, 112], [106, 112]],
  },
  {
    title: 'Assumir as rotinas',
    description: 'Acompanhar os processos recorrentes e reduzir a carga operacional da empresa.',
    result: 'Rotinas acompanhadas com mais consistência.',
    points: [[24, 80], [52, 80], [80, 80], [108, 80], [136, 80]],
  },
  {
    title: 'Entregar informação',
    description: 'Consolidar os movimentos do período em uma leitura mais clara.',
    result: 'Uma visão organizada do período para apoiar decisões.',
    points: [[24, 28], [24, 80], [24, 132], [84, 80], [140, 80]],
  },
  {
    title: 'Acompanhar decisões',
    description: 'Usar contexto e histórico para acompanhar prioridades e próximos passos.',
    result: 'Mais contexto para planejar o que vem depois.',
    points: [[24, 124], [52, 98], [80, 72], [108, 46], [136, 20]],
  },
] as const

export function ProcessSection() {
  const trackRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const sectionId = useId()
  const { activeIndex, staticLayout } = useProcessScrollProgress(trackRef, sceneRef, steps.length)
  useProcessReveal(trackRef, activeIndex, staticLayout)

  return (
    <section
      className={styles.section}
      data-theme-surface="dark"
      data-process-track=""
      data-process-layout={staticLayout ? 'static' : 'sticky'}
      ref={trackRef}
      id="processo"
      aria-labelledby="process-title"
    >
      <div className={`container ${styles.scene}`} ref={sceneRef} data-process-scene="">
        <header>
          <p className={styles.eyebrow}>Etapas conceituais</p>
          <div className={styles.heading}>
            <h2 id="process-title">Como uma rotina pode se organizar.</h2>
            <p>
              Uma sequência de referência para pensar o caminho entre conhecer a
              operação e acompanhar decisões.
            </p>
          </div>
        </header>

        <div className={styles.route}>
          <ol className={styles.timeline} aria-label="Etapas conceituais do processo">
            {steps.map(({ title }, index) => (
              <li
                className={styles.step}
                aria-current={!staticLayout && index === activeIndex ? 'step' : undefined}
                data-active={index === activeIndex}
                key={title}
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{title}</span>
              </li>
            ))}
          </ol>

          <div className={styles.chapters}>
            {steps.map(({ title, description, result, points }, index) => (
              <article
                aria-labelledby={`${sectionId}-${index}-heading`}
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
