import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { calculateTaxSimulation, type TaxSimulationInput, type RegimeResult } from './engine'
import { createSimulationUrl, readSharedSimulation, type SharedTaxSimulation, type TaxRegime } from './sharing'
import { FinancialToolShell } from '../shared/FinancialToolShell'
import { ShareActions } from '../shared/ShareActions'
import styles from './TaxSimulator.module.css'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })

function normalizeNumericInput(value: string) {
  const input = value.replace(/[^\d.,]/g, '')
  const separatorIndex = Math.max(input.lastIndexOf(','), input.lastIndexOf('.'))
  if (separatorIndex < 0) return input

  const integer = input.slice(0, separatorIndex).replace(/[.,]/g, '')
  const fraction = input.slice(separatorIndex + 1).replace(/[.,]/g, '')
  return fraction ? `${integer}.${fraction}` : `${integer}.`
}

function formatNumericInput(value: string, maximumFractionDigits: number) {
  if (!value || !Number.isFinite(Number(value))) return value
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(Number(value))
}

const regimes: { value: TaxRegime; label: string }[] = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
]

function MoneyField({
  label,
  value,
  unit = 'R$',
  step = '0.01',
  hint,
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  unit?: string
  step?: string
  hint?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const maximumFractionDigits = step === '0.1' ? 1 : 2
  const displayValue = focused ? value.replace('.', ',') : formatNumericInput(value, maximumFractionDigits)

  return (
    <label className={styles.field} data-disabled={disabled}>
      <span>{label}{hint && <small>{hint}</small>}</span>
      <div className={styles.moneyInput} data-suffix={unit === '%'}>
        <span aria-hidden="true">{unit}</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (value.endsWith('.')) onChange(value.slice(0, -1))
          }}
          onChange={(event) => onChange(normalizeNumericInput(event.target.value))}
        />
      </div>
    </label>
  )
}

function ActivityField({ value, legacy = false, onChange }: { value: TaxSimulationInput['activity']; legacy?: boolean; onChange: (value: TaxSimulationInput['activity']) => void }) {
  return (
    <label className={styles.field}>
      <span>Qual é a atividade principal?</span>
      <select value={value} onChange={(event) => onChange(event.target.value as TaxSimulationInput['activity'])}>
        <option value="">Selecione a atividade</option>
        <option value="commerce">{legacy ? 'Comércio' : 'Comércio de mercadorias'}</option>
        <option value="services-iii">{legacy ? 'Serviços Gerais' : 'Serviços (atividade confirmada)'}</option>
        {value === 'services-unconfirmed' && <option value="services-unconfirmed">{legacy ? 'Serviços Gerais' : 'Serviços (atividade a confirmar)'}</option>}
        <option value="industry">{legacy ? 'Indústria' : 'Indústria'}</option>
        {!legacy && value !== 'services-unconfirmed' && <option value="services-unconfirmed">Serviços (atividade a confirmar)</option>}
      </select>
    </label>
  )
}

function RevenueBasisField({ value, disabled = false, onChange }: { value: SharedTaxSimulation['revenueBasis']; disabled?: boolean; onChange: (value: SharedTaxSimulation['revenueBasis']) => void }) {
  return (
    <label className={styles.field} data-disabled={disabled}>
      <span>Quando essa receita foi gerada ou recebida?</span>
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value as SharedTaxSimulation['revenueBasis'])}>
        <option value="">Selecione</option>
        <option value="competencia">No mês em que foi gerada</option>
        <option value="caixa">No mês em que foi recebida</option>
      </select>
    </label>
  )
}

type RingSegment = {
  key: string
  label: string
  fullName: string
  valueCents: number
  percentageLabel: string
  tooltipText: string
}

const taxDescriptions: Record<string, { fullName: string; description: string }> = {
  das: { fullName: 'Tributos do Simples Nacional', description: 'Valor aproximado de tributos do Simples Nacional neste cenário.' },
  irpj: { fullName: 'Imposto de Renda da Pessoa Jurídica', description: 'Tributo federal calculado sobre a base aplicável à empresa neste cenário.' },
  csll: { fullName: 'Contribuição Social sobre o Lucro Líquido', description: 'Contribuição federal vinculada ao resultado da empresa.' },
  pis: { fullName: 'Programa de Integração Social', description: 'Contribuição federal considerada nesta estimativa tributária.' },
  cofins: { fullName: 'Contribuição para o Financiamento da Seguridade Social', description: 'Contribuição federal considerada nesta estimativa tributária.' },
}

function ResultRing({
  result,
  revenueCents,
  period,
}: {
  result: RegimeResult
  revenueCents: number
  period: 'monthly' | 'annual'
}) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [focusedSegment, setFocusedSegment] = useState<string | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ left: 8, top: 8 })
  const ringBlockRef = useRef<HTMLDivElement>(null)
  const activeSegment = hoveredSegment ?? focusedSegment ?? selectedSegment
  const isReady = result.status === 'ready' && revenueCents > 0
  const taxCents = isReady ? (period === 'monthly' ? result.monthlyCents : result.annualCents) : 0
  const share = isReady ? taxCents / revenueCents : 0
  const circumference = 2 * Math.PI * 74
  const periodValue = (value: { monthlyCents: number; annualCents: number }) => period === 'monthly' ? value.monthlyCents : value.annualCents
  const periodLabel = period === 'monthly' ? 'mensal' : 'anual'
  const taxSegments = isReady ? result.breakdown.map((item) => {
    const definition = taxDescriptions[item.key] ?? { fullName: item.label, description: 'Tributo incluído nesta estimativa simplificada.' }
    return {
      key: item.key,
      label: item.key === 'das'
        ? period === 'monthly' ? 'Impostos estimados' : 'Tributos equivalentes'
        : item.label,
      fullName: definition.fullName,
      valueCents: periodValue(item),
      percentageLabel: item.key === 'das'
        ? `${percent.format(revenueCents > 0 ? taxCents / revenueCents : 0)} da receita informada`
        : `${percent.format(taxCents > 0 ? periodValue(item) / taxCents : 0)} do total estimado`,
      tooltipText: definition.description,
    }
  }) : [{
    key: 'tax',
    label: period === 'monthly' ? 'Impostos estimados' : 'Tributos equivalentes',
    fullName: 'Tributos do Simples Nacional',
    valueCents: 0,
    percentageLabel: '—',
    tooltipText: 'Valor aproximado de tributos neste cenário.',
  }]
  const remainingSegment = {
    key: 'remaining',
    label: period === 'monthly' ? 'Receita após impostos' : 'Após tributos',
    fullName: 'Receita após impostos',
    valueCents: Math.max(revenueCents - taxCents, 0),
    percentageLabel: `${percent.format(revenueCents > 0 ? Math.max(revenueCents - taxCents, 0) / revenueCents : 0)} da receita informada`,
    tooltipText: 'Valor aproximado restante após os tributos incluídos nesta simulação.',
  }
  const segments: RingSegment[] = [...taxSegments, remainingSegment]
  const chartSegments = segments.filter((segment) => segment.valueCents > 0)
  const gap = chartSegments.length ? Math.min(8, circumference / (chartSegments.length * 2)) : 0
  const drawableCircumference = Math.max(circumference - gap * chartSegments.length, 0)
  const chartTotal = chartSegments.reduce((total, segment) => total + segment.valueCents, 0)
  let currentOffset = 0
  const arcs = chartSegments.map((segment) => {
    const arcLength = chartTotal ? (segment.valueCents / chartTotal) * drawableCircumference : 0
    const arc = { ...segment, arcLength, offset: currentOffset }
    currentOffset += arcLength + gap
    return arc
  })

  function updateTooltipPosition(target: Element, clientX: number, clientY: number) {
    const bounds = target.getBoundingClientRect()
    const pointerX = clientX || bounds.left + bounds.width / 2
    const pointerY = clientY || bounds.top + bounds.height / 2
    setTooltipPosition({
      left: Math.min(Math.max(8, pointerX + 14), Math.max(8, window.innerWidth - 304)),
      top: Math.min(Math.max(8, pointerY + 14), Math.max(8, window.innerHeight - 240)),
    })
  }

  function onSegmentKeyDown(event: React.KeyboardEvent<SVGCircleElement | HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setSelectedSegment(null)
      setHoveredSegment(null)
      setFocusedSegment(null)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const segment = event.currentTarget.dataset.segment
      if (segment) setSelectedSegment(segment)
      event.preventDefault()
    }
  }

  function onBlockBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && ringBlockRef.current?.contains(nextTarget)) return
    setFocusedSegment(null)
  }

  useEffect(() => {
    if (!selectedSegment) return
    function onDocumentPointerDown(event: PointerEvent) {
      if (!ringBlockRef.current?.contains(event.target as Node)) {
        setSelectedSegment(null)
        setHoveredSegment(null)
        setFocusedSegment(null)
      }
    }
    document.addEventListener('pointerdown', onDocumentPointerDown)
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
  }, [selectedSegment])

  const segmentProps = (segment: RingSegment, arcValue: string) => ({
    role: 'button' as const,
    tabIndex: isReady ? 0 : -1,
    'aria-label': `${segment.label}: ${arcValue}, ${segment.percentageLabel}`,
    'aria-describedby': activeSegment === segment.key ? `tax-simulation-${period}-ring-tooltip-${segment.key}` : undefined,
    'aria-pressed': selectedSegment === segment.key,
    'data-segment': segment.key,
    'data-kind': segment.key,
    'data-active': activeSegment === segment.key,
    onFocus: (event: React.FocusEvent<SVGCircleElement>) => {
      setFocusedSegment(segment.key)
      updateTooltipPosition(event.currentTarget, 0, 0)
    },
    onKeyDown: onSegmentKeyDown,
  })

  const hitAreaProps = (segment: RingSegment) => ({
    'aria-hidden': true,
    'data-segment': segment.key,
    'data-hit-area': segment.key,
    onPointerEnter: (event: React.PointerEvent<SVGCircleElement>) => {
      setHoveredSegment(segment.key)
      updateTooltipPosition(event.currentTarget, event.clientX, event.clientY)
    },
    onPointerMove: (event: React.PointerEvent<SVGCircleElement>) => updateTooltipPosition(event.currentTarget, event.clientX, event.clientY),
    onClick: (event: React.MouseEvent<SVGCircleElement>) => {
      event.stopPropagation()
      setSelectedSegment(segment.key)
      updateTooltipPosition(event.currentTarget, event.clientX, event.clientY)
    },
  })

  return (
    <div
      className={styles.ringBlock}
      data-period={period}
      ref={ringBlockRef}
      onPointerLeave={() => setHoveredSegment(null)}
      onBlurCapture={onBlockBlur}
    >
      <div className={styles.ring} data-has-active={Boolean(isReady && activeSegment)}>
        <svg
          viewBox="0 0 190 190"
          role="group"
          aria-label={isReady ? `Tributos: ${percent.format(share)} da receita ${periodLabel}` : 'Gráfico disponível após preencher os dados'}
          onClick={() => {
            setSelectedSegment(null)
            setHoveredSegment(null)
          }}
        >
          <circle className={styles.ringTrack} cx="95" cy="95" r="74" aria-hidden="true" />
          {arcs.map((segment) => {
            const value = money.format(segment.valueCents / 100)
            return (
              <circle
                className={segment.key === 'remaining' ? styles.ringRemaining : styles.ringTax}
                cx="95"
                cy="95"
                key={segment.key}
                r="74"
                strokeWidth="15"
                transform="rotate(-90 95 95)"
                strokeDasharray={`${segment.arcLength} ${circumference - segment.arcLength}`}
                strokeDashoffset={-segment.offset}
                {...segmentProps(segment, value)}
              />
            )
          })}
          {arcs.map((segment) => (
            <circle
              className={styles.ringHitArea}
              cx="95"
              cy="95"
              key={`hit-${segment.key}`}
              r="74"
              stroke="transparent"
              strokeWidth="28"
              transform="rotate(-90 95 95)"
              strokeDasharray={`${segment.arcLength} ${circumference - segment.arcLength}`}
              strokeDashoffset={-segment.offset}
              pointerEvents="stroke"
              {...hitAreaProps(segment)}
            />
          ))}
        </svg>
        <div className={styles.ringCenter} aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <span>Da receita</span>
          <strong>{isReady ? percent.format(share) : '—'}</strong>
        </div>
      </div>
      <div className={styles.legend}>
        {segments.map((segment) => (
          <LegendItem
            active={activeSegment === segment.key}
            selected={selectedSegment === segment.key}
            disabled={!isReady}
            key={segment.key}
            label={segment.label}
            value={isReady ? money.format(segment.valueCents / 100) : '—'}
            kind={segment.key}
            percentageLabel={segment.percentageLabel}
            tooltipId={`tax-simulation-${period}-ring-tooltip-${segment.key}`}
            onPosition={updateTooltipPosition}
            onEnter={(target, x, y) => {
              setHoveredSegment(segment.key)
              updateTooltipPosition(target, x, y)
            }}
            onSelect={() => setSelectedSegment(segment.key)}
            onFocus={(target) => {
              setFocusedSegment(segment.key)
              updateTooltipPosition(target, 0, 0)
            }}
            onKeyDown={onSegmentKeyDown}
          />
        ))}
      </div>
      {activeSegment && isReady && (() => {
        const segment = segments.find((item) => item.key === activeSegment)
        if (!segment) return null
        const value = money.format(segment.valueCents / 100)
        return createPortal(
          <div
            className={styles.ringTooltip}
            id={`tax-simulation-${period}-ring-tooltip-${segment.key}`}
            role="tooltip"
            style={{ left: `${tooltipPosition.left}px`, top: `${tooltipPosition.top}px`, position: 'fixed' }}
          >
            <strong>{segment.label}</strong>
            <span>{segment.fullName}</span>
            <b>{value}</b>
            <span className={styles.tooltipPercentage}>{segment.percentageLabel}</span>
            <p>{segment.tooltipText}</p>
          </div>,
          document.body,
        )
      })()}
    </div>
  )
}

function LegendItem({
  active,
  selected,
  disabled,
  label,
  value,
  kind,
  percentageLabel,
  tooltipId,
  onPosition,
  onEnter,
  onSelect,
  onFocus,
  onKeyDown,
}: {
  active: boolean
  selected: boolean
  disabled: boolean
  label: string
  value: string
  kind: string
  percentageLabel: string
  tooltipId: string
  onPosition: (target: Element, clientX: number, clientY: number) => void
  onEnter: (target: Element, clientX: number, clientY: number) => void
  onSelect: () => void
  onFocus: (target: Element) => void
  onKeyDown: (event: React.KeyboardEvent<SVGCircleElement | HTMLButtonElement>) => void
}) {
  const className = `${styles.legendItem} ${disabled ? styles.legendItemDisabled : ''}`
  if (disabled) {
    return <div className={className} aria-disabled="true"><span className={styles.legendDot} data-kind={kind} /><span>{label}</span><strong>{value}</strong></div>
  }

  return (
    <button
      className={className}
      type="button"
      aria-label={`${label}: ${value}, ${percentageLabel}`}
      aria-pressed={selected}
      aria-describedby={active ? tooltipId : undefined}
      data-active={active}
      data-segment={kind}
      onPointerEnter={(event) => onEnter(event.currentTarget, event.clientX, event.clientY)}
      onPointerMove={(event) => onPosition(event.currentTarget, event.clientX, event.clientY)}
      onClick={(event) => {
        onSelect()
        onPosition(event.currentTarget, event.clientX, event.clientY)
      }}
      onFocus={(event) => onFocus(event.currentTarget)}
      onKeyDown={onKeyDown}
    >
      <span className={styles.legendDot} data-kind={kind} />
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  )
}

function RegimeCard({
  name,
  result,
  highlighted,
  lowestMonthlyCents,
  comparisonReady,
}: {
  name: string
  result: RegimeResult
  highlighted: boolean
  lowestMonthlyCents: number
  comparisonReady: boolean
}) {
  const ready = result.status === 'ready'
  const difference = ready && comparisonReady ? result.monthlyCents - lowestMonthlyCents : null
  return (
    <li className={styles.regimeCard} data-ready={ready} data-highlighted={highlighted}>
      <span className={styles.regimeName}>{name}</span>
      <span className={styles.comparisonMetric}><strong>{ready ? money.format(result.monthlyCents / 100) : '—'}</strong><span>/ mês</span></span>
      <span className={styles.comparisonAnnual}>{ready ? money.format(result.annualCents / 100) : '—'} / ano</span>
      <span className={styles.comparisonDelta}>
        {difference === null ? ready ? '' : 'Informe os dados' : highlighted ? 'Menor carga estimada neste cenário' : `+ ${money.format(difference / 100)} / mês`}
      </span>
    </li>
  )
}

function resultMessage(result: RegimeResult) {
  if (result.status === 'ready') {
    const rate = `${percent.format(result.effectiveRate)} da receita mensal.`
    return rate
  }
  if (result.status === 'invalid') return 'Revise os valores informados.'
  return result.reason
}

export function TaxSimulator({ headingId }: { headingId: string }) {
  const [simulation, setSimulation] = useState<SharedTaxSimulation>(() => readSharedSimulation(window.location.search))
  const { input, regime } = simulation
  const calculationInput: TaxSimulationInput = {
    ...input,
    annualRevenue: simulation.annualRevenue,
    profitMargin: simulation.profitMargin,
    ordinarySimplesScenario: true,
    pastInitialYear: true,
    singleAnnexRevenue: true,
  }
  const result = calculateTaxSimulation(calculationInput)
  const selectedResult = regime === 'simples' ? result.simples : regime === 'presumido' ? result.presumido : result.real
  const shareUrl = createSimulationUrl(simulation, window.location)
  const annualRevenueCents = Math.round(Number(simulation.annualRevenue || 0) * 100)
  const simpleMonthlyRevenueCents = Math.round(Number(input.monthlyRevenue || 0) * 100)
  const monthlyRevenueCents = regime === 'simples' ? simpleMonthlyRevenueCents : Math.round(annualRevenueCents / 12)
  const displayedAnnualRevenueCents = regime === 'simples' ? simpleMonthlyRevenueCents * 12 : annualRevenueCents
  const comparisonEntries = [
    { key: 'simples' as const, name: 'Simples Nacional', result: result.simples },
    { key: 'presumido' as const, name: 'Lucro Presumido', result: result.presumido },
    { key: 'real' as const, name: 'Lucro Real', result: result.real },
  ]
  const hasCompleteComparison = result.lowestEstimatedCost !== null
  const lowestEntry = comparisonEntries.find(({ key }) => key === result.lowestEstimatedCost)
  const lowestComparisonCents = lowestEntry?.result.status === 'ready' ? lowestEntry.result.monthlyCents : 0

  function update<K extends keyof TaxSimulationInput>(key: K, value: TaxSimulationInput[K]) {
    if (key === 'monthlyRevenue') {
      const monthlyCents = value && Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : null
      setSimulation((current) => ({
        ...current,
        input: { ...current.input, monthlyRevenue: value as string },
        annualRevenue: monthlyCents === null ? '' : String(monthlyCents * 12 / 100),
      }))
      return
    }
    setSimulation((current) => ({ ...current, input: { ...current.input, [key]: value } }))
  }

  function updateAnnualRevenue(value: string) {
    const annualCents = value && Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : null
    const monthlyCents = annualCents === null ? null : Math.round(annualCents / 12)
    setSimulation((current) => ({
      ...current,
      annualRevenue: value,
      input: { ...current.input, monthlyRevenue: monthlyCents === null ? '' : String(monthlyCents / 100) },
    }))
  }

  function updateProfitMargin(value: string) {
    setSimulation((current) => ({ ...current, profitMargin: value }))
  }

  function updateRevenueBasis(value: SharedTaxSimulation['revenueBasis']) {
    setSimulation((current) => ({
      ...current,
      revenueBasis: value,
      input: { ...current.input, accrualBasis: value === 'competencia' },
    }))
  }

  function selectRegime(value: TaxRegime) {
    setSimulation((current) => ({ ...current, regime: value }))
  }

  const left = (
        <form className={styles.inputForm} onSubmit={(event) => event.preventDefault()}>
          <fieldset className={styles.regimePicker}>
            <legend><span>Etapa 1</span> Escolha um regime</legend>
            <div className={styles.regimeOptions}>
              {regimes.map((option) => (
                <button
                  aria-pressed={regime === option.value}
                  className={styles.regimeButton}
                  key={option.value}
                  onClick={() => selectRegime(option.value)}
                  type="button"
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className={styles.columnHeading}><span>Etapa 2</span><h4>Informe os dados</h4></div>
          {regime === 'simples' ? (
            <>
              <MoneyField label="Quanto faturou neste mês?" value={input.monthlyRevenue} onChange={(value) => update('monthlyRevenue', value)} />
              <MoneyField label="Quanto faturou nos últimos 12 meses?" hint="Ajuda a estimar o imposto pelo faturamento do ano." value={input.rbt12} onChange={(value) => update('rbt12', value)} />
              <ActivityField value={input.activity} onChange={(value) => update('activity', value)} />
              <RevenueBasisField value={simulation.revenueBasis} onChange={updateRevenueBasis} />
            </>
          ) : regime === 'presumido' ? (
            <>
              <MoneyField label="Faturamento Anual Previsto" value={simulation.annualRevenue} onChange={updateAnnualRevenue} />
              <ActivityField legacy value={input.activity} onChange={(value) => update('activity', value)} />
            </>
          ) : (
            <>
              <MoneyField label="Faturamento Anual Previsto" value={simulation.annualRevenue} onChange={updateAnnualRevenue} />
              <MoneyField label="Margem de Lucro Estimada (%)" value={simulation.profitMargin} unit="%" step="0.1" onChange={updateProfitMargin} />
            </>
          )}
          <ShareActions url={shareUrl} title="Simulação tributária Kapitalis" text="Confira esta simulação tributária." />
        </form>
  )

  const right = (
        <div className={styles.dashboard} data-regime={regime}>
          <div className={styles.heroMetric} role="status" aria-live="polite">
            <span>Imposto mensal estimado</span>
            <strong>{selectedResult.status === 'ready' ? money.format(selectedResult.monthlyCents / 100) : '—'}</strong>
            <p>{resultMessage(selectedResult)}</p>
          </div>

          <ResultRing result={selectedResult} revenueCents={monthlyRevenueCents} period="monthly" />
          <section className={styles.annualSection} aria-label="Equivalente anual">
            <div className={styles.annualHeading}>
              <div>
                <span>Equivalente anual</span>
                <p>Projeção anual do cenário informado.</p>
              </div>
              <strong>{selectedResult.status === 'ready' ? money.format(selectedResult.annualCents / 100) : '—'}</strong>
            </div>
            <div className={styles.annualRevenue}>
              <span>Faturamento anual de referência</span>
              <strong>{displayedAnnualRevenueCents > 0 ? money.format(displayedAnnualRevenueCents / 100) : '—'}</strong>
            </div>
            <ResultRing result={selectedResult} revenueCents={displayedAnnualRevenueCents} period="annual" />
          </section>

          <div className={styles.comparison}>
            <div className={styles.comparisonHeader}>
              <h5>Comparação de regimes</h5>
            </div>
            <ol>
              {comparisonEntries.map((entry) => (
                <RegimeCard
                  key={entry.key}
                  name={entry.name}
                  result={entry.result}
                  highlighted={hasCompleteComparison && entry.key === result.lowestEstimatedCost}
                  lowestMonthlyCents={lowestComparisonCents}
                  comparisonReady={hasCompleteComparison}
                />
              ))}
            </ol>
          </div>
          <p className={styles.estimateNote}>Estimativa simplificada. A definição do regime adequado depende de análise contábil completa.</p>
        </div>
  )

  return <FinancialToolShell title="Simulador Tributário 360º" headingId={headingId} left={left} right={right} leftClassName={styles.leftPane} rightClassName={styles.dashboardPane} />
}
