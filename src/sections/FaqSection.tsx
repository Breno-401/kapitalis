import { useId, useState } from 'react'
import styles from './FaqSection.module.css'

const questions = [
  {
    question: 'Posso misturar as contas da empresa com a minha conta pessoal?',
    answer: 'Não pode haver confusão patrimonial. A empresa deve ter sua própria conta e suas movimentações financeiras separadas das despesas pessoais dos sócios. Essa organização facilita o controle financeiro, a contabilidade e a correta apuração dos resultados da empresa.',
  },
  {
    question: 'Quanto o MEI pode faturar por ano? Existe limite mensal?',
    answer: 'O MEI possui um limite de faturamento anual de R$ 81 mil por ano, e por mês R$ 6.750,00. O faturamento pode variar de um mês para outro, desde que o limite anual seja respeitado. É importante acompanhar o faturamento ao longo do ano para evitar ultrapassar o limite sem planejamento.',
  },
  {
    question: 'Preciso emitir nota fiscal de todas as minhas vendas e serviços?',
    answer: 'Sim! A emissão da nota fiscal é fundamental para formalizar e comprovar as operações realizadas pela empresa. A nota deve ser emitida mesmo que o cliente não a solicite. Dessa forma, a empresa mantém suas receitas devidamente documentadas e a contabilidade consegue registrar corretamente toda a movimentação, garantindo mais segurança e transparência.',
  },
  {
    question: 'Posso retirar dinheiro da empresa para pagar minhas despesas pessoais?',
    answer: 'O dinheiro da empresa não deve ser tratado como dinheiro pessoal do sócio. As retiradas precisam ser organizadas e registradas corretamente, podendo ocorrer, conforme o caso, por meio de pró-labore ou distribuição de lucros. Separar essas movimentações evita problemas financeiros e contábeis.',
  },
  {
    question: 'Como saber se estou pagando impostos demais?',
    answer: 'O valor dos impostos depende de diversos fatores, como atividade, faturamento, regime tributário, folha de pagamento e forma de tributação. Uma análise tributária permite verificar se a empresa está enquadrada corretamente e se existem oportunidades legais para reduzir a carga tributária.',
  },
] as const

export function FaqSection() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const id = useId()

  return (
    <section className={styles.section} id="duvidas-frequentes" aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow} data-reveal="text">Respostas sobre a rotina</p>
        <h2 id={`${id}-title`} data-reveal="text" data-reveal-step="1">Dúvidas frequentes</h2>
        <div className={styles.layout}>
          <div className={styles.questions} role="group" aria-label="Perguntas frequentes">
            {questions.map(({ question, answer }, index) => {
              const expanded = selectedIndex === index
              const buttonId = `${id}-question-${index}`
              const panelId = `${id}-answer-${index}`
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
                  <div
                    aria-atomic="true"
                    aria-hidden={!expanded}
                    aria-labelledby={buttonId}
                    aria-live="polite"
                    className={styles.answerPanel}
                    data-open={expanded}
                    id={panelId}
                    inert={!expanded}
                    role="region"
                  >
                    <div className={styles.answerClip}>
                      <div className={styles.answerContent}>
                        <p className={styles.answerLabel}>Resposta</p>
                        <p className={styles.answerText}>{answer}</p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
