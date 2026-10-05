import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FaqSection } from './FaqSection'

describe('FAQ section', () => {
  it('keeps one answer panel mounted and replaces its content when a question is selected', () => {
    render(<FaqSection />)
    expect(screen.getByRole('heading', { level: 2, name: 'Dúvidas frequentes' })).toBeTruthy()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'true', 'false', 'false', 'false', 'false',
    ])

    const panelId = buttons[0]?.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(buttons.every((button) => button.getAttribute('aria-controls') === panelId)).toBe(true)
    const panel = screen.getByRole('region', { name: 'Posso misturar as contas da empresa com a minha conta pessoal?' })
    expect(panel.id).toBe(panelId)
    expect(within(panel).getByText(/Não pode haver confusão patrimonial/)).toBeTruthy()

    fireEvent.click(buttons[1]!)
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'false', 'true', 'false', 'false', 'false',
    ])
    expect(screen.getByRole('region', { name: 'Quanto o MEI pode faturar por ano? Existe limite mensal?' })).toBe(panel)
    expect(within(panel).getByText(/R\$ 81 mil por ano/)).toBeTruthy()
    expect(within(panel).queryByText(/confusão patrimonial/)).toBeNull()
  })

  it('keeps each question a native, keyboard-focusable button', () => {
    render(<FaqSection />)
    const question = screen.getByRole('button', { name: /Como saber se estou pagando impostos demais/ })
    question.focus()
    expect(document.activeElement).toBe(question)
    expect(question.tagName).toBe('BUTTON')
    expect((question as HTMLButtonElement).type).toBe('button')
    expect(question.getAttribute('aria-controls')).toBeTruthy()
  })

  it('renders the five approved questions and complete answers', () => {
    render(<FaqSection />)
    const expected = [
      'Posso misturar as contas da empresa com a minha conta pessoal?',
      'Quanto o MEI pode faturar por ano? Existe limite mensal?',
      'Preciso emitir nota fiscal de todas as minhas vendas e serviços?',
      'Posso retirar dinheiro da empresa para pagar minhas despesas pessoais?',
      'Como saber se estou pagando impostos demais?',
    ]
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim().replace(/\s+/g, ' ')))
      .toEqual(expected)
    fireEvent.click(screen.getByRole('button', { name: expected[2] }))
    expect(within(screen.getByRole('region', { name: expected[2] })).getByText(/A nota deve ser emitida mesmo que o cliente não a solicite/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: expected[4] }))
    expect(within(screen.getByRole('region', { name: expected[4] })).getByText(/Uma análise tributária permite verificar se a empresa está enquadrada corretamente/)).toBeTruthy()
  })
})
