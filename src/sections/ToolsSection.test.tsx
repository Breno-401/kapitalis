import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toolGroups } from '../data/tools'
import { ToolsSection } from './ToolsSection'

describe('native tools workspace', () => {
  it('connects the tools workspace to the next process section', () => {
    render(<ToolsSection />)

    expect(
      screen.getByRole('link', { name: 'Conhecer as etapas do processo' }).getAttribute('href'),
    ).toBe('#processo')
  })

  it('keeps all seven tools inside the tributary and people categories', () => {
    render(<ToolsSection />)

    const names = toolGroups.flatMap((group) => group.tools.map((tool) => tool.name))
    expect(names).toHaveLength(7)
    for (const name of [
      'Simulador Tributário 360º',
      'Calculadora de Pró-labore',
      'Calculadora de Custo CLT',
      'Calculadora de Rescisão',
      'Calculadora de Hora Extra',
      'Calculadora Simples Nacional',
      'Calculadora Fator R',
    ]) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
    expect(screen.getByRole('heading', { name: 'Tributário' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Pessoas e folha' })).toBeTruthy()
  })

  it('opens an unverified calculator natively and keeps its result unavailable', () => {
    render(<ToolsSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Calculadora Simples Nacional' }))

    expect(
      screen.getByRole('region', { name: 'Calculadora Simples Nacional' }),
    ).toBeTruthy()
    expect(screen.getByText(/fórmula aguardando validação/i)).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Resultado indisponível' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(screen.queryByRole('link', { name: /site oficial/i })).toBeNull()
  })

  it('updates the verified Fator R ratio from the rolling twelve-month inputs', () => {
    render(<ToolsSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Calculadora Fator R' }))
    fireEvent.change(
      screen.getByLabelText(/Receita bruta anual/),
      { target: { value: '100000' } },
    )
    fireEvent.change(
      screen.getByLabelText(/Folha anual incluindo pró-labore/),
      { target: { value: '28000' } },
    )

    expect(screen.getByText('28,0%')).toBeTruthy()
    expect(screen.getByText('Parâmetro de 28% atingido')).toBeTruthy()

    fireEvent.change(
      screen.getByLabelText(/Folha anual incluindo pró-labore/),
      { target: { value: '27000' } },
    )
    expect(screen.getByText('27,0%')).toBeTruthy()
    expect(screen.getByText('Abaixo do parâmetro de 28%')).toBeTruthy()
  })
})
