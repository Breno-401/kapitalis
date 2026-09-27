import { useState } from 'react'
import { calculateTaxSimulation, type TaxSimulationInput, type RegimeResult } from './engine'
import { createSimulationUrl, readSharedSimulation, type SharedTaxSimulation, type TaxRegime } from './sharing'
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

const regimes: { value: TaxRegime; label: string; pending: boolean }[] = [
  { value: 'simples', label: 'Simples Nacional', pending: false },
  { value: 'presumido', label: 'Lucro Presumido', pending: true },
  { value: 'real', label: 'Lucro Real', pending: true },
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

function ActivityField({ value, disabled = false, onChange }: { value: TaxSimulationInput['activity']; disabled?: boolean; onChange: (value: TaxSimulationInput['activity']) => void }) {
  return (
    <label className={styles.field} data-disabled={disabled}>
      <span>Qual é a atividade principal?</span>
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value as TaxSimulationInput['activity'])}>
        <option value="">Selecione a atividade</option>
        <option value="commerce">Comércio de mercadorias</option>
        <option value="industry">Indústria</option>
        <option value="services-iii">Serviços (atividade confirmada)</option>
        <option value="services-unconfirmed">Serviços (atividade a confirmar)</option>
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

type RingSegment = 'tax' | 'remaining'

function ResultRing({
  result,
  revenueCents,
  taxCents,
  period,
}: {
  result: RegimeResult
  revenueCents: number
  taxCents: number
  period: 'monthly' | 'annual'
}) {
  const [hoveredSegment, setHoveredSegment] = useState<RingSegment | null>(null)
  const activeSegment = hoveredSegment
  const isReady = result.status === 'ready' && revenueCents > 0
  const share = isReady ? Math.min(taxCents / revenueCents, 1) : 0
  const circumference = 2 * Math.PI * 74
  const gap = 10
  const visibleCircumference = circumference - gap
  const taxArcLength = share * visibleCircumference
  const remainingArcLength = (1 - share) * visibleCircumference
  const taxValue = isReady ? money.format(taxCents / 100) : '—'
  const remainingValue = isReady ? money.format(Math.max(revenueCents - taxCents, 0) / 100) : '—'
  const tooltipId = `tax-simulation-${period}-ring-tooltip`
  const periodLabel = period === 'monthly' ? 'mensal' : 'anual'
  const taxLabel = period === 'monthly' ? 'Impostos estimados' : 'Tributos equivalentes'
  const remainingLabel = period === 'monthly' ? 'Receita após impostos' : 'Após tributos'
  const tooltipText = {
    tax: 'Valor aproximado de tributos neste cenário.',
    remaining: 'Valor estimado restante após os tributos desta simulação.',
  }

  function clearHover(segment: RingSegment) {
    setHoveredSegment((current) => current === segment ? null : current)
  }

  function onSegmentKeyDown(event: React.KeyboardEvent<SVGCircleElement | HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setHoveredSegment(null)
    }
  }

  const segmentProps = (segment: RingSegment, label: string) => ({
    role: 'button' as const,
    tabIndex: isReady ? 0 : -1,
    'aria-label': label,
    'aria-describedby': activeSegment === segment ? tooltipId : undefined,
    'data-active': activeSegment === segment,
    onMouseEnter: () => setHoveredSegment(segment),
    onMouseLeave: () => clearHover(segment),
    onFocus: () => setHoveredSegment(segment),
    onBlur: () => clearHover(segment),
    onKeyDown: onSegmentKeyDown,
  })

  return (
    <div className={styles.ringBlock} data-period={period}>
      <div className={styles.ring} data-has-active={Boolean(isReady && activeSegment)}>
        <svg viewBox="0 0 190 190" role="group" aria-label={isReady ? `Tributos: ${percent.format(share)} da receita ${periodLabel}` : 'Gráfico disponível após validar os dados'}>
          <circle className={styles.ringTrack} cx="95" cy="95" r="74" aria-hidden="true" />
          {isReady && (
            <>
              <circle
                className={styles.ringTax}
                cx="95"
                cy="95"
                r="74"
                strokeDasharray={`${taxArcLength} ${circumference - taxArcLength}`}
                {...segmentProps('tax', `Segmento de ${period === 'monthly' ? 'impostos estimados' : 'tributos equivalentes'} ${periodLabel}: ${taxValue}`)}
              />
              <circle
                className={styles.ringRemaining}
                cx="95"
                cy="95"
                r="74"
                strokeDasharray={`${remainingArcLength} ${circumference - remainingArcLength}`}
                strokeDashoffset={-(taxArcLength + gap)}
                {...segmentProps('remaining', `Segmento de ${period === 'monthly' ? 'receita após impostos' : 'valor após tributos'} ${periodLabel}: ${remainingValue}`)}
              />
            </>
          )}
        </svg>
        <div className={styles.ringCenter} aria-hidden="true">
          <span>Da receita</span>
          <strong>{isReady ? percent.format(share) : '—'}</strong>
        </div>
      </div>
      <div className={styles.legend}>
        <LegendItem
          active={activeSegment === 'tax'}
          disabled={!isReady}
          label={taxLabel}
          value={taxValue}
          kind="tax"
          tooltipId={tooltipId}
          tooltipText={tooltipText.tax}
          onEnter={() => setHoveredSegment('tax')}
          onLeave={() => clearHover('tax')}
          onFocus={() => setHoveredSegment('tax')}
          onBlur={() => clearHover('tax')}
          onKeyDown={onSegmentKeyDown}
        />
        <LegendItem
          active={activeSegment === 'remaining'}
          disabled={!isReady}
          label={remainingLabel}
          value={remainingValue}
          kind="remaining"
          tooltipId={tooltipId}
          tooltipText={tooltipText.remaining}
          onEnter={() => setHoveredSegment('remaining')}
          onLeave={() => clearHover('remaining')}
          onFocus={() => setHoveredSegment('remaining')}
          onBlur={() => clearHover('remaining')}
          onKeyDown={onSegmentKeyDown}
        />
      </div>
    </div>
  )
}

function LegendItem({
  active,
  disabled,
  label,
  value,
  kind,
  tooltipId,
  tooltipText,
  onEnter,
  onLeave,
  onFocus,
  onBlur,
  onKeyDown,
}: {
  active: boolean
  disabled: boolean
  label: string
  value: string
  kind: RingSegment
  tooltipId: string
  tooltipText: string
  onEnter: () => void
  onLeave: () => void
  onFocus: () => void
  onBlur: () => void
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
      aria-label={`${label}: ${value}`}
      aria-describedby={active ? tooltipId : undefined}
      data-active={active}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <span className={styles.legendDot} data-kind={kind} />
      <span>{label}</span>
      <strong>{value}</strong>
      {active && <span className={styles.ringTooltip} id={tooltipId} role="tooltip">{tooltipText}</span>}
    </button>
  )
}

function RegimeRow({ name, result }: { name: string; result: RegimeResult }) {
  const value = result.status === 'ready'
    ? money.format(result.monthlyCents / 100)
    : result.status === 'invalid' ? 'Revise os dados' : 'Em validação'
  return (
    <li className={styles.regimeRow} data-ready={result.status === 'ready'}>
      <span className={styles.regimeName}>{name}</span>
      <span className={styles.regimeValue}>{value}</span>
    </li>
  )
}

function resultMessage(result: RegimeResult) {
  if (result.status === 'ready') return `${percent.format(result.effectiveRate)} da receita deste mês.`
  if (result.status === 'invalid') return 'Revise os valores informados.'
  return 'Cálculo em validação.'
}

export function TaxSimulator({ headingId }: { headingId: string }) {
  const [simulation, setSimulation] = useState<SharedTaxSimulation>(() => readSharedSimulation(window.location.search))
  const [copyState, setCopyState] = useState('')
  const { input, regime } = simulation
  const calculationInput: TaxSimulationInput = {
    ...input,
    ordinarySimplesScenario: true,
    pastInitialYear: true,
    singleAnnexRevenue: true,
  }
  const result = calculateTaxSimulation(calculationInput)
  const selectedResult = regime === 'simples' ? result.simples : regime === 'presumido' ? result.presumido : result.real
  const comparisonSimples = result.simples
  const shareUrl = createSimulationUrl(simulation, window.location)
  const monthlyRevenueCents = Math.round(Number(input.monthlyRevenue || 0) * 100)
  const annualRevenueCents = monthlyRevenueCents * 12

  function update<K extends keyof TaxSimulationInput>(key: K, value: TaxSimulationInput[K]) {
    setSimulation((current) => ({ ...current, input: { ...current.input, [key]: value } }))
    setCopyState('')
  }

  function updateRevenueBasis(value: SharedTaxSimulation['revenueBasis']) {
    setSimulation((current) => ({
      ...current,
      revenueBasis: value,
      input: { ...current.input, accrualBasis: value === 'competencia' },
    }))
    setCopyState('')
  }

  function selectRegime(value: TaxRegime) {
    setSimulation((current) => ({ ...current, regime: value }))
    setCopyState('')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState('Link copiado')
    } catch {
      setCopyState('Não foi possível copiar. Selecione o link acima.')
    }
  }

  return (
    <section className={styles.shell} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h3 id={headingId}>Simulador Tributário 360º</h3>
      </div>

      <div className={styles.columns}>
        <form className={styles.inputs} onSubmit={(event) => event.preventDefault()}>
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
                  {option.pending && <small>Em validação</small>}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={styles.columnHeading}><span>Etapa 2</span><h4>Informe os dados</h4></div>
          <MoneyField label="Quanto faturou neste mês?" value={input.monthlyRevenue} disabled={regime !== 'simples'} onChange={(value) => update('monthlyRevenue', value)} />
          <MoneyField label="Quanto faturou nos últimos 12 meses?" hint="Ajuda a estimar o imposto pelo faturamento do ano." value={input.rbt12} disabled={regime !== 'simples'} onChange={(value) => update('rbt12', value)} />
          <ActivityField value={input.activity} disabled={regime !== 'simples'} onChange={(value) => update('activity', value)} />
          <RevenueBasisField value={simulation.revenueBasis} disabled={regime !== 'simples'} onChange={updateRevenueBasis} />
        </form>

        <div className={styles.dashboard} data-regime={regime}>
          <div className={styles.heroMetric} role="status" aria-live="polite">
            <span>Imposto mensal estimado</span>
            <strong>{selectedResult.status === 'ready' ? money.format(selectedResult.monthlyCents / 100) : '—'}</strong>
            <p>{resultMessage(selectedResult)}</p>
          </div>

          <ResultRing result={selectedResult} revenueCents={monthlyRevenueCents} taxCents={selectedResult.status === 'ready' ? selectedResult.monthlyCents : 0} period="monthly" />
          <section className={styles.annualSection} aria-label="Equivalente anual">
            <div className={styles.annualHeading}>
              <div>
                <span>Equivalente anual</span>
                <p>Equivalente se o mesmo cenário mensal se repetir por 12 meses.</p>
              </div>
              <strong>{selectedResult.status === 'ready' ? money.format(selectedResult.annualCents / 100) : '—'}</strong>
            </div>
            <div className={styles.annualRevenue}>
              <span>Receita anual equivalente</span>
              <strong>{regime === 'simples' && monthlyRevenueCents > 0 ? money.format(annualRevenueCents / 100) : '—'}</strong>
            </div>
            <ResultRing
              result={selectedResult}
              revenueCents={annualRevenueCents}
              taxCents={selectedResult.status === 'ready' ? selectedResult.annualCents : 0}
              period="annual"
            />
          </section>

          <div className={styles.comparison}>
            <div className={styles.comparisonHeader}>
              <h5>Comparação de regimes</h5>
              <div className={styles.interpretation}>
                <span>Menor carga estimada nesta simulação</span>
                <strong>Em validação</strong>
              </div>
            </div>
            <ol>
              <RegimeRow name="Simples Nacional" result={comparisonSimples} />
              <RegimeRow name="Lucro Presumido" result={result.presumido} />
              <RegimeRow name="Lucro Real" result={result.real} />
            </ol>
          </div>
        </div>
      </div>

      <div className={styles.belowCalculator}>
        <div className={styles.share}>
          <label htmlFor="tax-simulation-link">Deseja compartilhar sua simulação?</label>
          <div><input id="tax-simulation-link" readOnly value={shareUrl} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyLink}>Copiar link</button></div>
          <span aria-live="polite">{copyState}</span>
        </div>

        <div className={styles.expertCta}>
          <span>Precisa avaliar seu caso com mais detalhe?</span>
          <a href="https://wa.me/5527998829289" target="_blank" rel="noopener noreferrer">Falar com um especialista →</a>
        </div>
      </div>
    </section>
  )
}
