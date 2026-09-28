import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FaqSection } from './FaqSection'

describe('FAQ section', () => {
  it('keeps one answer panel mounted and replaces its content when a question is selected', () => {
    render(<FaqSection />)
    expect(screen.getByRole('heading', { level: 2, name: 'Dúvidas frequentes' })).toBeTruthy()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'true', 'false', 'false', 'false',
    ])

    const panelId = buttons[0]?.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(buttons.every((button) => button.getAttribute('aria-controls') === panelId)).toBe(true)
    const panel = screen.getByRole('region', { name: 'Como saber se o caixa realmente está disponível?' })
    expect(panel.id).toBe(panelId)
    expect(within(panel).getByText(/Olhar entradas e saídas/)).toBeTruthy()

    fireEvent.click(buttons[1]!)
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'false', 'true', 'false', 'false',
    ])
    expect(screen.getByRole('region', { name: 'Como organizar pagamentos e recebimentos?' })).toBe(panel)
    expect(within(panel).getByText(/contas a pagar e a receber/)).toBeTruthy()
    expect(within(panel).queryByText(/Olhar entradas e saídas/)).toBeNull()
  })

  it('keeps each question a native, keyboard-focusable button', () => {
    render(<FaqSection />)
    const question = screen.getByRole('button', { name: /Como ter mais previsibilidade financeira/ })
    question.focus()
    expect(document.activeElement).toBe(question)
    expect(question.tagName).toBe('BUTTON')
    expect((question as HTMLButtonElement).type).toBe('button')
    expect(question.getAttribute('aria-controls')).toBeTruthy()
  })

  it('keeps answers grounded in the existing services and process copy', () => {
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: /Como antecipar tributos/ }))
    expect(within(screen.getByRole('region', { name: /Como antecipar tributos/ })).getByText(/calendário financeiro e contábil/)).toBeTruthy()
    expect(screen.queryByText(/garantimos|clientes|certificado/i)).toBeNull()
  })
})
