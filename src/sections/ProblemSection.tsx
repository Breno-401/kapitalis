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
]

export function ProblemSection() {
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

        <ul className={styles.questions}>
          {questions.map(({ topic, question, focus }) => (
            <li className={styles.question} key={topic}>
              <span className={styles.topic}>{topic}</span>
              <h3>{question}</h3>
              <span className={styles.focus}>{focus}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
