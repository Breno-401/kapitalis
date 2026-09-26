import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProblemSection } from './ProblemSection'

const questions = [
  'O caixa que sobra no papel também está disponível na conta?',
  'Que pagamentos vencem primeiro — e o que ainda precisa entrar?',
  'Os tributos e obrigações do mês estão claros antes do vencimento?',
  'Você consegue olhar para as próximas semanas com previsibilidade?',
]

describe('financial context section', () => {
  it('keeps four routine questions in an accessible selector', () => {
    render(<ProblemSection />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'A rotina da empresa também deixa perguntas.',
      }),
    ).toBeTruthy()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'CAIXA' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain(questions[0])

    fireEvent.keyDown(screen.getByRole('tab', { name: 'CAIXA' }), { key: 'ArrowDown' })
    expect(screen.getByRole('tab', { name: 'PAGAMENTOS' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'TRIBUTOS' }))
    expect(screen.getByRole('tab', { name: 'TRIBUTOS' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain(questions[2])
    expect(screen.getByRole('tabpanel').textContent).toContain('Obrigações fiscais')

    const text = document.body.textContent ?? ''
    expect(
      text.match(/(?:R\$\s*\d|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\s*(?:estrelas?|clientes|empresas)\b)/i),
    ).toBeNull()
  })
})
