import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

describe('tax simulator experience', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('distinguishes missing inputs from rules pending validation', () => {
    render(<ToolsSection />)
    expect(screen.getByText('Dados incompletos')).toBeTruthy()
    expect(screen.getAllByText('Pendente de validação')).toHaveLength(2)
  })

  it('updates the verified DAS estimate live and leaves the regime ranking unresolved', () => {
    render(<ToolsSection />)
    fireEvent.change(screen.getByLabelText(/Receita bruta do mês/), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText(/RBT12 — receita dos 12 meses anteriores/), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Atividade e anexo'), { target: { value: 'services-iii' } })
    fireEvent.click(screen.getByLabelText(/empresa optante e elegível/i))

    expect(screen.getAllByText('R$ 600,00')).toHaveLength(3)
    expect(screen.getByText('R$ 7.200,00')).toBeTruthy()
    expect(screen.getByText('6,00%')).toBeTruthy()
    expect(screen.getByText(/Comparação indisponível/)).toBeTruthy()
    expect(screen.queryByText(/melhor regime/i)).toBeNull()
  })

  it('copies a reproducible URL containing only simulation data', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ToolsSection />)
    fireEvent.change(screen.getByLabelText(/Receita bruta do mês/), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText(/RBT12 — receita dos 12 meses anteriores/), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Atividade e anexo'), { target: { value: 'commerce' } })
    fireEvent.click(screen.getByLabelText(/empresa optante e elegível/i))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link da simulação' }))

    expect(writeText).toHaveBeenCalledOnce()
    const copied = new URL(writeText.mock.calls[0]![0] as string)
    expect(Object.fromEntries(copied.searchParams)).toEqual({ mensal: '10000', rbt12: '120000', atividade: 'commerce', cenarioPadrao: '1' })
    expect(await screen.findByText('Link copiado')).toBeTruthy()
  })

  it('restores a shared scenario and shows pending validation when annex is unknown', () => {
    window.history.replaceState({}, '', '/?mensal=15000&rbt12=180000&atividade=services-unconfirmed&cenarioPadrao=1')
    render(<ToolsSection />)
    expect((screen.getByLabelText(/Receita bruta do mês/) as HTMLInputElement).value).toBe('15000')
    expect(screen.getAllByText(/Confirme o anexo aplicável/)).toHaveLength(2)
  })
})
