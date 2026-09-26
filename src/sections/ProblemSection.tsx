import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import styles from './ProblemSection.module.css'

const questions = [
  {
    topic: 'CAIXA',
    question: 'O caixa que sobra no papel também está disponível na conta?',
    focus: 'Entradas e saídas',
  },
  {
    topic: 'PAGAMENTOS',
    question: 'Que pagamentos vencem primeiro — e o que ainda precisa entrar?',
    focus: 'Contas e vencimentos',
  },
  {
    topic: 'TRIBUTOS',
    question: 'Os tributos e obrigações do mês estão claros antes do vencimento?',
    focus: 'Obrigações fiscais',
  },
  {
    topic: 'PREVISIBILIDADE',
    question: 'Você consegue olhar para as próximas semanas com previsibilidade?',
    focus: 'Visão do mês',
  },
] as const

export function ProblemSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const sectionId = useId()
  const activeQuestion = questions[activeIndex]!
  const activeTabId = `${sectionId}-tab-${activeIndex}`
  const panelId = `${sectionId}-panel`

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (index + 1) % questions.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (index - 1 + questions.length) % questions.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = questions.length - 1
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
      id="contexto"
      aria-labelledby="contexto-title"
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Questões que fazem parte da rotina</p>
        <SectionHeading
          className={styles.heading}
          id="contexto-title"
          title="A rotina da empresa também deixa perguntas."
          description="As respostas sobre o mês podem estar espalhadas entre extrato, vencimentos e obrigações."
        />

        <div className={styles.explorer}>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Escolha uma questão financeira"
            aria-orientation="vertical"
          >
            {questions.map(({ topic }, index) => (
              <button
                aria-controls={panelId}
                aria-selected={index === activeIndex}
                className={styles.tab}
                id={`${sectionId}-tab-${index}`}
                key={topic}
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
                <span className={styles.tabTopic}>{topic}</span>
                <span className={styles.tabMark} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div
            aria-labelledby={activeTabId}
            className={styles.panel}
            id={panelId}
            role="tabpanel"
            tabIndex={0}
          >
            <span className={styles.panelIndex} aria-hidden="true">
              QUESTÃO {String(activeIndex + 1).padStart(2, '0')} / 04
            </span>
            <div className={styles.panelMessage} aria-live="polite">
              <h3 key={activeQuestion.topic}>{activeQuestion.question}</h3>
            </div>
            <div className={styles.panelFocus}>
              <span className={styles.focusNode} aria-hidden="true" />
              <span>LEITURA DA ROTINA</span>
              <strong>{activeQuestion.focus}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
