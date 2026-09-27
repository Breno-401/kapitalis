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
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const id = useId()

  return (
    <section className={styles.section} id="duvidas-frequentes" aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Respostas sobre a rotina</p>
        <h2 id={`${id}-title`}>Dúvidas frequentes</h2>
        <div className={styles.accordion}>
          {questions.map(({ question, answer }, index) => {
            const expanded = openIndex === index
            const buttonId = `${id}-question-${index}`
            const panelId = `${id}-answer-${index}`
            return (
              <article className={styles.item} key={question}>
                <h3>
                  <button
                    aria-controls={panelId}
                    aria-expanded={expanded}
                    className={styles.question}
                    id={buttonId}
                    onClick={() => setOpenIndex((current) => current === index ? null : index)}
                    type="button"
                  >
                    <span>{question}</span>
                    <span className={styles.mark} aria-hidden="true" data-open={expanded} />
                  </button>
                </h3>
                <div aria-labelledby={buttonId} className={styles.answer} hidden={!expanded} id={panelId}>
                  <p>{answer}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
