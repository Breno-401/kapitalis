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

  function fillValidSimplesInputs() {
    fireEvent.change(screen.getByLabelText(/Quanto faturou neste mês/), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText(/Quanto faturou nos últimos 12 meses/), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Qual é a atividade principal?'), { target: { value: 'services-iii' } })
    fireEvent.change(screen.getByLabelText(/Quando essa receita foi gerada ou recebida/), { target: { value: 'competencia' } })
  }

  it('keeps regime selection and inputs in the left column beside live results', () => {
    const { container } = render(<ToolsSection />)
    const regimePicker = screen.getByRole('group', { name: /escolha um regime/i })
    const inputs = screen.getByLabelText(/Quanto faturou neste mês/).closest('form')
    const results = inputs?.nextElementSibling

    if (!inputs || !results) throw new Error('The calculator columns did not render.')
    expect(inputs.contains(regimePicker)).toBe(true)
    expect(results.contains(screen.getByRole('status'))).toBe(true)
    expect(container.contains(results)).toBe(true)
  })

  it('formats blurred money fields in Brazilian notation and edits them as plain digits', () => {
    render(<ToolsSection />)
    const revenue = screen.getByLabelText(/Quanto faturou neste mês/) as HTMLInputElement
    fireEvent.change(revenue, { target: { value: '10000' } })
    fireEvent.blur(revenue)
    expect(revenue.value).toBe('10.000')

    fireEvent.focus(revenue)
    expect(revenue.value).toBe('10000')
    fireEvent.change(revenue, { target: { value: '10000,50' } })
    expect(revenue.value).toBe('10000,50')
  })

  it('shows a verified result automatically from the four fields without extra confirmations', () => {
    const { container } = render(<ToolsSection />)
    expect(screen.getByText('Revise os valores informados.')).toBeTruthy()
    fillValidSimplesInputs()

    expect(screen.getByRole('status').textContent).toMatch(/R\$\s600,00/)
    expect(screen.getAllByText('R$ 7.200,00')).toHaveLength(2)
    expect(container.querySelector('details')).toBeNull()
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
    expect(screen.queryByText('Como calculamos')).toBeNull()
  })

  it('updates the main value, breakdown and rings immediately when the monthly revenue changes', () => {
    render(<ToolsSection />)
    fillValidSimplesInputs()
    const monthlyArc = screen.getByRole('button', { name: /Segmento de impostos estimados mensal/ })

    fireEvent.change(screen.getByLabelText(/Quanto faturou neste mês/), { target: { value: '20000' } })

    expect(screen.getByRole('status').textContent).toMatch(/R\$\s1\.200,00/)
    expect(screen.getByText('R$ 18.800,00')).toBeTruthy()
    expect(screen.getAllByText('R$ 14.400,00')).toHaveLength(2)
    expect(monthlyArc.getAttribute('aria-label')).toMatch(/1\.200,00/)
    expect(screen.getByText('Equivalente se o mesmo cenário mensal se repetir por 12 meses.')).toBeTruthy()
  })

  it('recalculates the effective rate immediately when the twelve-month revenue changes', () => {
    render(<ToolsSection />)
    fillValidSimplesInputs()
    expect(screen.getByRole('status').textContent).toMatch(/R\$\s600,00/)

    fireEvent.change(screen.getByLabelText(/Quanto faturou nos últimos 12 meses/), { target: { value: '240000' } })

    expect(screen.getByRole('status').textContent).toMatch(/R\$\s730,00/)
    expect(screen.getByText('7,30% da receita deste mês.')).toBeTruthy()
  })

  it('links monthly and annual legends to their rings with hover and keyboard tooltips', () => {
    render(<ToolsSection />)
    fillValidSimplesInputs()
    expect(screen.getAllByText('R$ 600,00')).toHaveLength(3)
    expect(screen.getAllByText('R$ 7.200,00')).toHaveLength(2)
    expect(screen.getByText('Equivalente anual')).toBeTruthy()
    expect(screen.getByText('Menor carga estimada nesta simulação')).toBeTruthy()
    expect(screen.queryByText(/melhor regime/i)).toBeNull()
    const taxArc = screen.getByRole('button', { name: /Segmento de impostos estimados/ })
    const taxLegend = screen.getByRole('button', { name: /Impostos estimados/ })
    fireEvent.mouseEnter(taxArc)
    expect(taxLegend.getAttribute('data-active')).toBe('true')
    expect(screen.getAllByRole('tooltip')[0]?.textContent).toBe('Valor aproximado de tributos neste cenário.')

    fireEvent.mouseLeave(taxArc)
    const remainingLegend = screen.getByRole('button', { name: /Receita após impostos/ })
    fireEvent.focus(remainingLegend)
    expect(screen.getByRole('button', { name: /Segmento de receita após impostos/ }).getAttribute('data-active')).toBe('true')
    expect(screen.getAllByRole('tooltip').some((tooltip) => tooltip.textContent === 'Valor estimado restante após os tributos desta simulação.')).toBe(true)
    fireEvent.blur(remainingLegend)
    expect(remainingLegend.getAttribute('data-active')).toBe('false')

    const annualTaxArc = screen.getByRole('button', { name: /Segmento de tributos equivalentes anual/ })
    fireEvent.focus(annualTaxArc)
    expect(screen.getByRole('button', { name: /Tributos equivalentes/ }).getAttribute('data-active')).toBe('true')
    expect(screen.getAllByRole('tooltip').some((tooltip) => tooltip.textContent === 'Valor aproximado de tributos neste cenário.')).toBe(true)
  })

  it('keeps cash-basis estimates pending because separate receipt data is unavailable', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ToolsSection />)
    fireEvent.change(screen.getByLabelText(/Quanto faturou neste mês/), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText(/Quanto faturou nos últimos 12 meses/), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Qual é a atividade principal?'), { target: { value: 'commerce' } })
    fireEvent.change(screen.getByLabelText(/Quando essa receita foi gerada ou recebida/), { target: { value: 'caixa' } })

    expect((screen.getByLabelText(/Quando essa receita foi gerada ou recebida/) as HTMLSelectElement).value).toBe('caixa')
    expect(screen.getByRole('status').textContent).toContain('—')
    expect(screen.getByText('Cálculo em validação.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }))
    expect(writeText).toHaveBeenCalledOnce()
    const shared = new URL(writeText.mock.calls[0]![0] as string)
    expect(shared.searchParams.get('baseReceita')).toBe('caixa')
    expect(shared.searchParams.has('competencia')).toBe(false)
  })

  it('keeps identical inputs, monthly and annual results, and comparison slots across unsupported regimes', () => {
    const { container } = render(<ToolsSection />)
    fillValidSimplesInputs()
    const inputs = screen.getByLabelText(/Quanto faturou neste mês/).closest('form')
    const fields = () => inputs?.querySelectorAll('input, select')
    const dashboard = () => container.querySelector('[class*="dashboard"]')
    const initialFields = fields()?.length
    const initialResultSlots = dashboard()?.querySelectorAll('[data-period], [aria-label="Equivalente anual"], ol').length
    expect(initialFields).toBe(4)
    expect(initialResultSlots).toBe(4)

    for (const regimeName of ['Lucro Presumido', 'Lucro Real']) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(regimeName) }))
      expect(screen.getAllByText('Cálculo em validação.')).toHaveLength(1)
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(8)
      expect(fields()?.length).toBe(initialFields)
      expect(Array.from(fields() ?? []).every((field) => (field as HTMLInputElement).disabled)).toBe(true)
      expect(dashboard()?.querySelectorAll('[data-period], [aria-label="Equivalente anual"], ol').length).toBe(initialResultSlots)
      expect(screen.getByRole('status').querySelector('strong')?.textContent).toBe('—')
      expect(screen.getByRole('region', { name: 'Equivalente anual' }).textContent).toContain('—')
    }

    const regimeGroup = screen.getByRole('group', { name: /escolha um regime/i })
    fireEvent.click(regimeGroup.querySelectorAll('button')[0]!)
    expect(screen.getByRole('status').textContent).toMatch(/R\$\s600,00/)
    expect(Array.from(fields() ?? []).every((field) => !(field as HTMLInputElement).disabled)).toBe(true)
  })

  it('copies a reproducible URL containing only simulation data', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ToolsSection />)
    fillValidSimplesInputs()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }))

    expect(writeText).toHaveBeenCalledOnce()
    const copied = new URL(writeText.mock.calls[0]![0] as string)
    expect(Object.fromEntries(copied.searchParams)).toEqual({ mensal: '10000', rbt12: '120000', atividade: 'services-iii', competencia: '1' })
    expect(await screen.findByText('Link copiado')).toBeTruthy()
  })

  it('shares and restores an unvalidated regime without adding tax results', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { unmount } = render(<ToolsSection />)

    fireEvent.click(screen.getByRole('button', { name: /Lucro Real/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }))

    const shared = new URL(writeText.mock.calls[0]![0] as string)
    expect(shared.searchParams.get('regime')).toBe('real')
    expect(shared.searchParams.has('imposto')).toBe(false)

    unmount()
    window.history.replaceState({}, '', `${shared.pathname}${shared.search}${shared.hash}`)
    render(<ToolsSection />)
    expect(screen.getAllByText('Cálculo em validação.')).toHaveLength(1)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(8)
  })

  it('keeps the expert action after sharing with the approved destination and a clear button treatment', () => {
    const { container } = render(<ToolsSection />)
    const share = screen.getByLabelText(/Deseja compartilhar sua simulação/).parentElement?.parentElement
    const expertLink = screen.getByRole('link', { name: 'Falar com um especialista →' })
    expect(share?.nextElementSibling?.contains(expertLink)).toBe(true)
    expect(expertLink.getAttribute('href')).toBe('https://wa.me/5527998829289')
    expect(expertLink.getAttribute('target')).toBe('_blank')
    expect(expertLink.getAttribute('rel')).toBe('noopener noreferrer')
    expect(container.querySelector('details')).toBeNull()
  })
})
