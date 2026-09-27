import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FaqSection } from './FaqSection'

describe('FAQ section', () => {
  it('exposes four button-controlled answers with the correct expansion state', () => {
    render(<FaqSection />)
    expect(screen.getByRole('heading', { level: 2, name: 'Dúvidas frequentes' })).toBeTruthy()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    expect(buttons.every((button) => button.getAttribute('aria-expanded') === 'false')).toBe(true)

    fireEvent.click(buttons[1]!)
    expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true')
    const panelId = buttons[1]?.getAttribute('aria-controls')
    const panel = document.getElementById(panelId ?? '')
    expect(panel?.hidden).toBe(false)
    expect(within(panel!).getByText(/contas a pagar e a receber/)).toBeTruthy()

    fireEvent.click(buttons[1]!)
    expect(buttons[1]?.getAttribute('aria-expanded')).toBe('false')
    expect(panel?.hidden).toBe(true)
  })

  it('keeps answers grounded in the existing services and process copy', () => {
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: /Como antecipar tributos/ }))
    expect(screen.getByText(/calendário financeiro e contábil/)).toBeTruthy()
    expect(screen.queryByText(/garantimos|clientes|certificado/i)).toBeNull()
  })
})
