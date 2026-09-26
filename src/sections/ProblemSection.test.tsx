import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProblemSection } from './ProblemSection'

const questions = [
  'O caixa que sobra no papel também está disponível na conta?',
  'Que pagamentos vencem primeiro — e o que ainda precisa entrar?',
  'Os tributos e obrigações do mês estão claros antes do vencimento?',
  'Você consegue olhar para as próximas semanas com previsibilidade?',
]

describe('financial context section', () => {
  it('problem_section_renders_editorial_questions_without_fake_proof', () => {
    render(<ProblemSection />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'A rotina da empresa também deixa perguntas.',
      }),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual(questions)

    const text = document.body.textContent ?? ''
    expect(
      text.match(/(?:R\$\s*\d|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\s*(?:estrelas?|clientes|empresas)\b)/i),
    ).toBeNull()
  })
})
