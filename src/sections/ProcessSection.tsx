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

        <ol className={styles.steps} aria-label="Etapas conceituais do processo">
          {steps.map(({ title, description }, index) => (
            <li className={styles.step} key={title}>
              <span className={styles.stepNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
