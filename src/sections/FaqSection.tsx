import { useId, useState } from 'react'
import styles from './FaqSection.module.css'

const questions = [
  {
    question: 'Como saber se o caixa realmente está disponível?',
    answer: 'Olhar entradas e saídas junto com os compromissos do período ajuda a entender o que está disponível. A conciliação financeira e o fluxo de caixa organizam essa leitura.',
  },
  {
    question: 'Como organizar pagamentos e recebimentos?',
    answer: 'A rotina pode reunir contas a pagar e a receber, conciliação financeira, fluxo de caixa e relatórios em um mesmo acompanhamento.',
  },
  {
    question: 'Como antecipar tributos e obrigações?',
    answer: 'Organizar o calendário financeiro e contábil ajuda a acompanhar tributos e obrigações antes dos vencimentos. A equipe pode conversar sobre o que se aplica à empresa.',
  },
  {
    question: 'Como ter mais previsibilidade financeira?',
    answer: 'Com pagamentos, recebimentos, compromissos e fluxo de caixa organizados, os relatórios ajudam a acompanhar o período e pensar nos próximos passos.',
  },
] as const

export function FaqSection() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const id = useId()
  const panelId = `${id}-answer-panel`
  const selectedQuestion = questions[selectedIndex]!
  const selectedButtonId = `${id}-question-${selectedIndex}`

  return (
    <section className={styles.section} id="duvidas-frequentes" aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow} data-reveal="text">Respostas sobre a rotina</p>
        <h2 id={`${id}-title`} data-reveal="text" data-reveal-step="1">Dúvidas frequentes</h2>
        <div className={styles.layout}>
          <div className={styles.questions} role="group" aria-label="Perguntas frequentes">
            {questions.map(({ question }, index) => {
              const expanded = selectedIndex === index
              const buttonId = `${id}-question-${index}`
              return (
                <article className={styles.item} key={question} data-reveal="text" data-reveal-step={index + 2}>
                  <h3>
                    <button
                      aria-controls={panelId}
                      aria-expanded={expanded}
                      className={styles.question}
                      data-active={expanded}
                      id={buttonId}
                      onClick={() => setSelectedIndex(index)}
                      type="button"
                    >
                      <span>{question}</span>
                      <span className={styles.mark} aria-hidden="true" data-open={expanded} />
                    </button>
                  </h3>
                </article>
              )
            })}
          </div>
          <div
            aria-atomic="true"
            aria-labelledby={selectedButtonId}
            aria-live="polite"
            className={styles.answerPanel}
            data-reveal="text"
            data-reveal-step="2"
            id={panelId}
            role="region"
          >
            <div className={styles.answerContent} key={selectedIndex}>
              <p className={styles.answerLabel}>Resposta</p>
              <h3 className={styles.answerTitle}>{selectedQuestion.question}</h3>
              <p className={styles.answerText}>{selectedQuestion.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
