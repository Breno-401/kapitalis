import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProcessSection } from './ProcessSection'

describe('conceptual process section', () => {
  it('presents five ordered steps without claiming a validated company method', () => {
    render(<ProcessSection />)

    const region = screen.getByRole('region', { name: /Como uma rotina pode se organizar/ })
    const steps = within(region).getAllByRole('heading', { level: 3 })
    expect(steps.map((step) => step.textContent)).toEqual([
      'Entender a operação',
      'Organizar os dados',
      'Assumir as rotinas',
      'Entregar informação',
      'Acompanhar decisões',
    ])
    expect(within(region).getByText(/Etapas conceituais/i)).toBeTruthy()
  })
})
