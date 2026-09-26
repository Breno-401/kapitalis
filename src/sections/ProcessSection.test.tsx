import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProcessSection } from './ProcessSection'

describe('conceptual process section', () => {
  it('presents an interactive five-step route without claiming a validated company method', () => {
    render(<ProcessSection />)

    const region = screen.getByRole('region', { name: /Como uma rotina pode se organizar/ })
    const tabs = within(region).getAllByRole('tab')
    expect(tabs.map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Entender a operação',
      'Organizar os dados',
      'Assumir as rotinas',
      'Entregar informação',
      'Acompanhar decisões',
    ])
    expect(within(region).getByRole('tabpanel').textContent).toContain('Conhecer o contexto e a rotina atual da empresa.')
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(tabs[2]!)
    expect(tabs[2]?.getAttribute('aria-selected')).toBe('true')
    expect(within(region).getByRole('tabpanel').textContent).toContain('Organizar o calendário financeiro e contábil.')
    expect(within(region).getByText(/Etapas conceituais/i)).toBeTruthy()
  })
})
