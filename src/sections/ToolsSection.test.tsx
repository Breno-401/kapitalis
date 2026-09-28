import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToolsSection } from './ToolsSection'

function tax() {
  return within(screen.getByRole('region', { name: 'Simulador Tributário 360º' }))
}

function complementary() {
  return within(screen.getByRole('region', { name: 'Área de simulação complementar' }))
}

function fillSimpleScenario() {
  const scope = tax()
  fireEvent.change(scope.getByLabelText(/Quanto faturou neste mês/), { target: { value: '10000' } })
  fireEvent.change(scope.getByLabelText(/Quanto faturou nos últimos 12 meses/), { target: { value: '120000' } })
  fireEvent.change(scope.getByLabelText('Qual é a atividade principal?'), { target: { value: 'services-iii' } })
  fireEvent.change(scope.getByLabelText(/Quando essa receita foi gerada ou recebida/), { target: { value: 'competencia' } })
}

function fillMoney(scope: ReturnType<typeof within>, label: RegExp | string, centsDigits: string) {
  fireEvent.change(scope.getByLabelText(label), { target: { value: centsDigits } })
}

describe('Simulador Tributário 360º', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    Reflect.deleteProperty(navigator, 'share')
    Reflect.deleteProperty(navigator, 'clipboard')
    vi.useRealTimers()
  })

  it('mantém seleção, formulário e resultado vivo no mesmo shell', () => {
    render(<ToolsSection />)
    const scope = tax()
    const regimeGroup = scope.getByRole('group', { name: /escolha um regime/i })
    expect(within(regimeGroup).getAllByRole('button')).toHaveLength(3)
    expect(scope.getByRole('heading', { name: 'Simulador Tributário 360º' })).toBeTruthy()

    fillSimpleScenario()
    expect(scope.getByRole('status').textContent).toMatch(/R\$/)
    expect(scope.getAllByRole('group', { name: /gráfico interativo|tributos/i }).length).toBeGreaterThan(0)

    fireEvent.click(within(regimeGroup).getByRole('button', { name: 'Lucro Presumido' }))
    expect(scope.getByLabelText(/Faturamento Anual Previsto/)).toBeTruthy()
    expect(scope.getByLabelText('Qual é a atividade principal?')).toBeTruthy()
    expect(scope.queryByLabelText(/Quando essa receita/)).toBeNull()

    fireEvent.click(within(regimeGroup).getByRole('button', { name: 'Lucro Real' }))
    expect(scope.getByLabelText(/Margem de Lucro Estimada/)).toBeTruthy()
    expect(scope.queryByLabelText('Qual é a atividade principal?')).toBeNull()
  })

  it('ativa uma fatia do SVG diretamente e sincroniza legenda e tooltip', () => {
    const { container } = render(<ToolsSection />)
    fillSimpleScenario()
    const ring = container.querySelector('[data-period="monthly"]')
    const hitArea = ring?.querySelector('circle[data-hit-area="das"]')
    expect(hitArea).toBeTruthy()
    fireEvent.pointerEnter(hitArea!, { clientX: 280, clientY: 280 })
    expect(ring?.querySelector('button[data-segment="das"]')?.getAttribute('data-active')).toBe('true')
    expect(screen.getByRole('tooltip').textContent).toMatch(/Tributos do Simples Nacional/)
    expect(ring?.querySelector('circle[data-segment="das"]')?.getAttribute('stroke-width')).toBe('22.5')
    expect(ring?.querySelector('circle[data-segment="remaining"]')?.getAttribute('stroke-width')).toBe('15')

    fireEvent.pointerLeave(ring!)
    expect(ring?.querySelector('circle[data-segment="das"]')?.getAttribute('stroke-width')).toBe('15')
    const remaining = ring?.querySelector<HTMLButtonElement>('button[data-segment="remaining"]')
    fireEvent.click(remaining!)
    expect(remaining?.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('tooltip').textContent).toMatch(/Receita após impostos/)

    const annualRing = container.querySelector('[data-period="annual"]')
    const annualHitArea = annualRing?.querySelector('circle[data-hit-area="remaining"]')
    fireEvent.pointerDown(annualHitArea!)
    fireEvent.click(annualHitArea!)
    expect(annualRing?.querySelector('button[data-segment="remaining"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('tooltip').textContent).toMatch(/Após tributos/)

    const keyboardSegment = ring?.querySelector<SVGCircleElement>('circle[data-segment="das"]')
    expect(keyboardSegment?.getAttribute('tabindex')).toBe('0')
    fireEvent.focus(keyboardSegment!)
    fireEvent.keyDown(keyboardSegment!, { key: 'Enter' })
    expect(keyboardSegment?.getAttribute('aria-pressed')).toBe('true')
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('mantém a confirmação de cópia separada do label estável', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ToolsSection />)
    fillSimpleScenario()
    const button = tax().getByRole('button', { name: 'Copiar link' })
    expect(button.textContent).toContain('Copiar link')
    fireEvent.click(button)
    expect(await tax().findByText('Link copiado', { selector: '[aria-live="polite"]' })).toBeTruthy()
    expect(button.textContent).toContain('Copiar link')
    expect(button.textContent).not.toContain('Link copiado')
    expect(writeText).toHaveBeenCalledOnce()
  })

  it('compartilha o estado simplificado e deixa o CTA no rodapé comum', () => {
    render(<ToolsSection />)
    fillSimpleScenario()
    const scope = tax()
    const form = scope.getByLabelText(/Deseja compartilhar esta simulação/)
    expect(form.tagName).toBe('DIV')
    expect(scope.getByRole('link', { name: 'Falar com um especialista →' }).getAttribute('href')).toBe('https://wa.me/5527998829289')
    expect(screen.getByRole('region', { name: 'Área de simulação complementar' })).toBeTruthy()
  })

  it('oferece opções acessíveis quando o navegador não tem compartilhamento nativo', () => {
    Reflect.deleteProperty(navigator, 'share')
    render(<ToolsSection />)
    const scope = tax()
    const button = scope.getByRole('button', { name: 'Compartilhar' })
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(scope.getByRole('link', { name: 'Compartilhar no WhatsApp' }).getAttribute('href')).toContain('wa.me')
  })
})

describe('Ferramentas Complementares', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('substitui o catálogo de cards por cinco modos no shell único', () => {
    render(<ToolsSection />)
    const scope = complementary()
    const picker = scope.getByRole('group', { name: /escolha uma ferramenta/i })
    expect(within(picker).getAllByRole('button')).toHaveLength(5)
    for (const name of ['Pró-labore', 'Custo CLT', 'Rescisão', 'Hora Extra', 'Fator R']) {
      expect(within(picker).getByRole('button', { name })).toBeTruthy()
    }
    expect(screen.queryByRole('heading', { name: 'Pessoas e folha' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Calculadora Simples Nacional' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Calculadora Fator R' })).toBeNull()
  })

  it('calcula pró-labore e usa a divisão por sócios e o INSS de 11%', () => {
    render(<ToolsSection />)
    const scope = complementary()
    fillMoney(scope, /Faturamento \/ Lucro Mensal/, '1000000')
    fireEvent.change(scope.getByLabelText('Número de Sócios'), { target: { value: '2' } })
    fillMoney(scope, /Pró-labore Desejado/, '200000')
    expect(scope.getByRole('status').textContent).toContain('R$ 5.560,00')
    expect(scope.getAllByText('INSS estimado').length).toBeGreaterThan(0)
  })

  it('sincroniza fatia, legenda, tooltip e teclado no gráfico complementar', () => {
    const { container } = render(<ToolsSection />)
    const scope = complementary()
    fillMoney(scope, /Faturamento \/ Lucro Mensal/, '1000000')
    fillMoney(scope, /Pró-labore Desejado/, '200000')
    fireEvent.change(scope.getByLabelText('Número de Sócios'), { target: { value: '2' } })

    const ring = container.querySelector('[data-tool-mode="prolabore"]')
    const directSegment = ring?.querySelector('circle[data-hit-area="prolabore"]')
    expect(directSegment).toBeTruthy()
    fireEvent.pointerEnter(directSegment!, { clientX: 180, clientY: 180 })
    expect(ring?.querySelector('[data-segment-group="prolabore"]')?.getAttribute('data-active')).toBe('true')
    expect(ring?.querySelector('circle[data-segment="prolabore"]')?.getAttribute('stroke-width')).toBe('24')
    expect(screen.getByRole('tooltip').textContent).toMatch(/Pró-labore total dos sócios/)

    const legend = ring?.querySelector<HTMLButtonElement>('button[data-segment="distributable"]')
    expect(legend).toBeTruthy()
    fireEvent.pointerLeave(directSegment!.closest('div[class*="layout"]')!)
    fireEvent.click(legend!)
    expect(legend!.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('tooltip').textContent).toMatch(/Lucro líquido distribuível/)

    const keyboardSegment = ring?.querySelector<SVGCircleElement>('circle[data-segment="inss"]')
    expect(keyboardSegment?.getAttribute('tabindex')).toBe('0')
    fireEvent.focus(keyboardSegment!)
    fireEvent.keyDown(keyboardSegment!, { key: 'Enter' })
    expect(ring?.querySelector('button[data-segment="inss"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('tooltip').textContent).toMatch(/11%/)
  })

  it('recalcula CLT, rescisão e hora extra com as entradas legadas', () => {
    render(<ToolsSection />)
    const scope = complementary()
    fireEvent.click(scope.getByRole('button', { name: 'Custo CLT' }))
    fillMoney(scope, /Salário Bruto Mensal/, '1000000')
    fireEvent.change(scope.getByLabelText('Regime de Tributação'), { target: { value: 'lucro' } })
    expect(scope.getByRole('status').textContent).toContain('R$ 15.524,44')

    fireEvent.click(scope.getByRole('button', { name: 'Rescisão' }))
    fillMoney(scope, /Último Salário/, '300000')
    fireEvent.change(scope.getByLabelText('Meses Trabalhados'), { target: { value: '13' } })
    expect(scope.getByRole('status').textContent).toContain('R$ 7.831,33')

    fireEvent.click(scope.getByRole('button', { name: 'Hora Extra' }))
    fillMoney(scope, /Salário Base Mensal/, '220000')
    fireEvent.change(scope.getByLabelText('Quantidade de Horas'), { target: { value: '10' } })
    expect(scope.getByRole('status').textContent).toContain('R$ 2.380,00')
    expect(scope.getByText(/Estimativa simplificada usando a fórmula legada/)).toBeTruthy()
  })

  it('mantém as ações de compartilhamento no mesmo shell nos cinco modos', () => {
    render(<ToolsSection />)
    const scope = complementary()
    const shell = screen.getByRole('region', { name: 'Área de simulação complementar' })
    const stableColumns = shell.querySelector('[data-stable-height="true"]')

    expect(stableColumns).toBeTruthy()
    expect(shell.querySelector('[data-financial-inputs] [data-share-actions]')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Conhecer as etapas do processo' })).toBeNull()

    for (const tool of ['Pró-labore', 'Custo CLT', 'Rescisão', 'Hora Extra', 'Fator R']) {
      fireEvent.click(scope.getByRole('button', { name: tool }))
      expect(shell.querySelector('[data-stable-height="true"]')).toBe(stableColumns)
      expect(shell.querySelector('[data-financial-inputs] [data-share-actions]')).toBeTruthy()
      expect(shell.querySelector('[data-financial-footer]')).toBeTruthy()
    }
  })

  it('não repete o link para as etapas logo antes da seção de processo', () => {
    render(<ToolsSection />)
    expect(screen.queryByRole('link', { name: 'Conhecer as etapas do processo' })).toBeNull()
  })

  it('mostra Fator R, compara com o parâmetro legado e preserva a atividade escolhida', () => {
    render(<ToolsSection />)
    const scope = complementary()
    fireEvent.click(scope.getByRole('button', { name: 'Fator R' }))
    fillMoney(scope, /Receita Bruta Anual/, '10000000')
    fillMoney(scope, /Folha de Pagamento Anual/, '2800000')
    fireEvent.change(scope.getByLabelText('Profissão / Atividade'), { target: { value: 'Advocacia' } })
    expect(scope.getByRole('status').textContent).toContain('28,00%')
    expect(scope.getAllByText(/parâmetro de 28%/i).length).toBeGreaterThan(0)
    expect(scope.getByLabelText('Profissão / Atividade')).toHaveProperty('value', 'Advocacia')
    expect(scope.getByText(/não confirma anexo nem enquadramento tributário/)).toBeTruthy()
    fireEvent.click(scope.getByRole('button', { name: 'Hora Extra' }))
    fireEvent.click(scope.getByRole('button', { name: 'Fator R' }))
    expect(scope.getByLabelText(/Receita Bruta Anual/)).toHaveProperty('value', '100.000,00')
    expect(scope.getByRole('status').textContent).toContain('28,00%')
  })

  it('não desenha uma composição proporcional quando a folha supera a receita', () => {
    const { container } = render(<ToolsSection />)
    const scope = complementary()
    fireEvent.click(scope.getByRole('button', { name: 'Fator R' }))
    fillMoney(scope, /Receita Bruta Anual/, '10000000')
    fillMoney(scope, /Folha de Pagamento Anual/, '12000000')
    expect(scope.getByRole('status').textContent).toContain('120,00%')
    expect(container.querySelector('[data-tool-mode="fatorr"] svg')).toBeNull()
    expect(scope.getByText(/gráfico proporcional não é exibido/)).toBeTruthy()
  })

  it('serializa somente o modo e os campos ativos e os restaura ao abrir o link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { unmount } = render(<ToolsSection />)
    let scope = complementary()
    fireEvent.click(scope.getByRole('button', { name: 'Fator R' }))
    fillMoney(scope, /Receita Bruta Anual/, '10000000')
    fillMoney(scope, /Folha de Pagamento Anual/, '2800000')
    fireEvent.click(scope.getByRole('button', { name: 'Hora Extra' }))
    fillMoney(scope, /Salário Base Mensal/, '220000')
    fireEvent.change(scope.getByLabelText('Quantidade de Horas'), { target: { value: '10' } })
    fireEvent.click(scope.getByRole('button', { name: 'Copiar link' }))
    const shared = new URL(writeText.mock.calls[0]![0] as string)
    expect(shared.searchParams.get('tool')).toBe('horaextra')
    expect(shared.searchParams.get('salary')).toBe('220000')
    expect(shared.searchParams.get('hours')).toBe('10')
    expect(shared.searchParams.has('revenue')).toBe(false)

    unmount()
    window.history.replaceState({}, '', `${shared.pathname}${shared.search}${shared.hash}`)
    render(<ToolsSection />)
    scope = complementary()
    expect(scope.getByRole('button', { name: 'Hora Extra' }).getAttribute('aria-pressed')).toBe('true')
    expect(scope.getByLabelText(/Salário Base Mensal/)).toHaveProperty('value', '2.200,00')
    expect(scope.getByLabelText('Quantidade de Horas')).toHaveProperty('value', '10')
    expect(scope.getByRole('status').textContent).toContain('R$ 2.380,00')
  })

  it('reinicia o feedback de cópia sem mudar dimensões do controle', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ToolsSection />)
    const scope = complementary()
    const button = scope.getByRole('button', { name: 'Copiar link' })
    const before = { width: button.style.width, height: button.style.height, text: button.textContent }
    vi.useFakeTimers()
    fireEvent.click(button)
    await act(async () => { await Promise.resolve() })
    fireEvent.click(button)
    await act(async () => { await Promise.resolve() })
    expect(button.textContent).toBe(before.text)
    expect(button.style.width).toBe(before.width)
    expect(button.style.height).toBe(before.height)
    expect(button.getAttribute('data-copied')).toBe('true')
    act(() => { vi.advanceTimersByTime(1800) })
    expect(button.getAttribute('data-copied')).toBe('false')
    expect(writeText).toHaveBeenCalledTimes(2)
  })
})
