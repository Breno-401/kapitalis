import { useId, useState } from 'react'
import { calculateCltCost, calculateFactorR, calculateOvertime, calculatePartnerCompensation, calculateTermination } from './engines'
import { createComplementaryUrl, defaultValues, readSharedComplementary, type ComplementaryMode, type ComplementaryValues } from './sharing'
import { FinancialToolShell } from '../shared/FinancialToolShell'
import { InteractiveBreakdownRing, type BreakdownSegment } from '../shared/InteractiveBreakdownRing'
import { ShareActions } from '../shared/ShareActions'
import styles from './ComplementarySimulator.module.css'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const moneyInputFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modes: { id: ComplementaryMode; label: string }[] = [
  { id: 'prolabore', label: 'Pró-labore' },
  { id: 'clt', label: 'Custo CLT' },
  { id: 'rescisao', label: 'Rescisão' },
  { id: 'horaextra', label: 'Hora Extra' },
  { id: 'fatorr', label: 'Fator R' },
]

const activities = [
  'Clínica Médica / Medicina', 'Arquitetura e Urbanismo', 'Engenharia',
  'Consultoria Empresarial', 'Advocacia', 'Odontologia', 'Psicologia', 'Outros Sujeitos ao Fator R',
]

function displayMoneyInput(digits: string) {
  if (!digits) return ''
  return moneyInputFormat.format(Number(digits) / 100)
}

function MoneyField({ label, value, inputId, onChange }: { label: string; value: string; inputId: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span>{label}</span>
      <span className={styles.moneyControl}>
        <span aria-hidden="true">R$</span>
        <input
          autoComplete="off"
          id={inputId}
          inputMode="numeric"
          type="text"
          value={displayMoneyInput(value)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
        />
      </span>
    </label>
  )
}

function NumberField({ label, value, inputId, onChange, min = '0', step = '1', placeholder }: {
  label: string; value: string; inputId: string; onChange: (value: string) => void; min?: string; step?: string; placeholder?: string
}) {
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span>{label}</span>
      <input className={styles.control} id={inputId} inputMode="decimal" min={min} step={step} type="number" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function SelectField({ label, value, inputId, options, onChange }: {
  label: string; value: string; inputId: string; options: { value: string; label: string }[]; onChange: (value: string) => void
}) {
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span>{label}</span>
      <select className={styles.control} id={inputId} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

function BreakdownRows({ segments }: { segments: BreakdownSegment[] }) {
  if (!segments.length) return null
  return (
    <dl className={styles.breakdown}>
      {segments.map((segment) => (
        <div className={styles.breakdownRow} key={segment.key}>
          <dt>{segment.label}</dt><dd>{money.format(segment.value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ComplementarySimulator({ headingId }: { headingId: string }) {
  const initial = readSharedComplementary(window.location.search)
  const [mode, setMode] = useState<ComplementaryMode>(initial.mode)
  const [valuesByMode, setValuesByMode] = useState<Record<ComplementaryMode, ComplementaryValues>>(() => ({
    ...defaultValues,
    [initial.mode]: initial.values,
  }))
  const values = valuesByMode[mode]
  const ids = useId()
  const shareUrl = createComplementaryUrl(mode, values, window.location)

  function selectMode(nextMode: ComplementaryMode) {
    setMode(nextMode)
  }

  function update(key: string, value: string) {
    setValuesByMode((current) => ({ ...current, [mode]: { ...current[mode], [key]: value } }))
  }

  const partnerResult = mode === 'prolabore' ? calculatePartnerCompensation({ profit: values.profit ?? '', partnerCount: values.partners ?? '1', compensationPerPartner: values.compensation ?? '' }) : null
  const cltResult = mode === 'clt' ? calculateCltCost({ salary: values.salary ?? '', regime: values.regime === 'lucro' ? 'lucro' : 'simples' }) : null
  const terminationResult = mode === 'rescisao' ? calculateTermination({ salary: values.salary ?? '', workedMonths: values.months ?? '', reason: values.reason === 'pedido' ? 'pedido' : 'sem-justa-causa' }) : null
  const overtimeResult = mode === 'horaextra' ? calculateOvertime({ salary: values.salary ?? '', monthlyHours: values.monthlyHours ?? '220', overtimeHours: values.hours ?? '', premiumPercent: values.premium ?? '50' }) : null
  const factorRResult = mode === 'fatorr' ? calculateFactorR({ revenue: values.revenue ?? '', payroll: values.payroll ?? '', activity: values.activity ?? activities[0]! }) : null

  let resultLabel = ''
  let resultValue = '—'
  let status = 'Preencha os dados à esquerda para ver a estimativa.'
  let segments: BreakdownSegment[] = []
  let note = 'Estimativa simplificada baseada nos parâmetros do simulador público legado. A leitura serve como referência e não substitui uma análise profissional.'

  if (partnerResult) {
    resultLabel = 'Lucro líquido distribuível'
    resultValue = money.format(partnerResult.distributableProfit)
    status = 'Projeção mensal do lucro após pró-labore e INSS estimado.'
    segments = partnerResult.disbursement <= partnerResult.profit ? [
      { key: 'prolabore', label: 'Pró-labore total', fullName: 'Pró-labore total dos sócios', value: partnerResult.totalCompensation, description: 'Soma dos valores de pró-labore informados para os sócios.' },
      { key: 'inss', label: 'INSS estimado', fullName: 'Estimativa de INSS (11%)', value: partnerResult.socialSecurity, description: 'Estimativa calculada a 11% sobre o pró-labore total informado.' },
      { key: 'distributable', label: 'Lucro distribuível', fullName: 'Lucro líquido distribuível', value: partnerResult.distributableProfit, description: 'Lucro informado após subtrair o pró-labore total e o INSS estimado.' },
    ].filter(({ value }) => value > 0) : []
    if (!segments.length) note += ' O gráfico não é exibido quando o valor informado de pró-labore e INSS supera o lucro.'
  } else if (cltResult) {
    resultLabel = 'Custo mensal estimado'
    resultValue = money.format(cltResult.totalMonthlyCost)
    status = 'Composição mensal com salário, encargos e provisões exibidos abaixo.'
    const additionalCosts = cltResult.totalMonthlyCost - cltResult.salary
    segments = [
      { key: 'salary', label: 'Salário bruto', fullName: 'Salário bruto mensal', value: cltResult.salary, description: 'Salário bruto mensal informado.' },
      { key: 'charges', label: 'Encargos e provisões', fullName: 'Encargos e provisões estimados', value: additionalCosts, description: 'Soma de FGTS, INSS patronal conforme o regime selecionado, provisão de 13º e férias + 1/3.' },
    ].filter(({ value }) => value > 0)
    note = 'Estimativa simplificada com os percentuais e provisões do simulador público legado. O regime selecionado reproduz a premissa usada naquela ferramenta.'
  } else if (terminationResult) {
    resultLabel = 'Total estimado da rescisão'
    resultValue = money.format(terminationResult.total)
    status = 'Estimativa das verbas consideradas pelo simulador público legado.'
    segments = [
      { key: 'base', label: 'Último salário', fullName: 'Último salário considerado', value: terminationResult.salary, description: 'Salário mensal incluído na soma principal do simulador legado.' },
      { key: 'notice', label: 'Aviso prévio', fullName: 'Aviso prévio estimado', value: terminationResult.notice, description: 'No motor legado, corresponde a um salário apenas na demissão sem justa causa.' },
      { key: 'thirteenth', label: '13º proporcional', fullName: '13º salário proporcional', value: terminationResult.thirteenthSalary, description: 'Estimativa proporcional calculada a partir dos meses trabalhados, com a regra de doze meses do motor legado.' },
      { key: 'vacation', label: 'Férias + 1/3', fullName: 'Férias proporcionais + 1/3', value: terminationResult.vacationPay, description: 'Estimativa proporcional calculada com o fator 1,3333 usado no motor legado.' },
      { key: 'penalty', label: 'Multa FGTS (40%)', fullName: 'Multa estimada sobre FGTS', value: terminationResult.fgtsPenalty, description: 'O motor legado estima 40% sobre o FGTS acumulado calculado a 8% por mês.' },
    ].filter(({ value }) => value > 0)
    note = 'Estimativa simplificada baseada apenas nas parcelas exibidas. A rescisão real depende dos dados e da análise do caso.'
  } else if (overtimeResult) {
    resultLabel = 'Novo salário mensal estimado'
    resultValue = money.format(overtimeResult.salaryWithOvertime)
    status = `Inclui ${money.format(overtimeResult.totalOvertimeCost)} em horas extras e DSR estimados.`
    segments = [
      { key: 'overtime', label: 'Horas extras', fullName: 'Total em horas extras', value: overtimeResult.overtimePay, description: 'Valor das horas extras usando a jornada, quantidade de horas e adicional informados.' },
      { key: 'dsr', label: 'Reflexo no DSR', fullName: 'Reflexo estimado no DSR', value: overtimeResult.weeklyRest, description: 'O motor legado calcula o DSR como o valor das horas extras dividido por 25 e multiplicado por 5.' },
    ].filter(({ value }) => value > 0)
    note = 'Estimativa simplificada usando a fórmula legada de horas extras e DSR. O valor não é uma apuração de folha.'
  } else if (factorRResult) {
    resultLabel = 'Fator R estimado'
    resultValue = `${percent.format(factorRResult.ratio)}%`
    status = factorRResult.thresholdReached ? 'A razão calculada alcança o parâmetro de 28% usado pelo motor legado.' : 'A razão calculada fica abaixo do parâmetro de 28% usado pelo motor legado.'
    const otherRevenue = Math.max(factorRResult.revenue - factorRResult.payroll, 0)
    segments = factorRResult.ratio <= 100 ? [
      { key: 'payroll', label: 'Folha informada', fullName: 'Folha de pagamento anual informada', value: factorRResult.payroll, description: 'Folha de pagamento informada, incluindo pró-labore, conforme o campo da ferramenta legada.' },
      { key: 'revenue-rest', label: 'Demais receitas', fullName: 'Receita além da folha informada', value: otherRevenue, description: 'Diferença entre a receita bruta dos últimos 12 meses e a folha informada; representa a proporção restante neste gráfico.' },
    ].filter(({ value }) => value > 0) : []
    note = 'A atividade selecionada fica registrada para referência, mas não altera esta razão simplificada. O resultado não confirma anexo nem enquadramento tributário.'
    if (factorRResult.ratio > 100) note += ' O gráfico proporcional não é exibido quando a folha informada supera a receita.'
  }

  const hasInput = Boolean(partnerResult || cltResult || terminationResult || overtimeResult || factorRResult)
  if (!hasInput && mode === 'horaextra' && Number.parseFloat(values.hours ?? '') < 0) status = 'Revise os valores: a quantidade de horas não pode ser negativa.'

  const left = (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <fieldset className={styles.modePicker}>
        <legend><span>Etapa 1</span> Escolha uma ferramenta</legend>
        <div className={styles.modeOptions}>
          {modes.map((option) => (
            <button aria-pressed={mode === option.id} className={styles.modeButton} key={option.id} onClick={() => selectMode(option.id)} type="button">
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.stepHeading}><span>Etapa 2</span><h4>Informe os dados</h4></div>
      <div className={styles.fields}>
        {mode === 'prolabore' && <>
          <MoneyField label="Faturamento / Lucro Mensal (R$)" inputId={`${ids}-profit`} value={values.profit ?? ''} onChange={(value) => update('profit', value)} />
          <NumberField label="Número de Sócios" inputId={`${ids}-partners`} value={values.partners ?? '1'} onChange={(value) => update('partners', value)} step="any" placeholder="1" />
          <MoneyField label="Pró-labore Desejado (por sócio)" inputId={`${ids}-compensation`} value={values.compensation ?? ''} onChange={(value) => update('compensation', value)} />
        </>}
        {mode === 'clt' && <>
          <MoneyField label="Salário Bruto Mensal" inputId={`${ids}-salary`} value={values.salary ?? ''} onChange={(value) => update('salary', value)} />
          <SelectField label="Regime de Tributação" inputId={`${ids}-regime`} value={values.regime ?? 'simples'} onChange={(value) => update('regime', value)} options={[{ value: 'simples', label: 'Simples Nacional' }, { value: 'lucro', label: 'Lucro Presumido / Real' }]} />
        </>}
        {mode === 'rescisao' && <>
          <MoneyField label="Último Salário" inputId={`${ids}-salary`} value={values.salary ?? ''} onChange={(value) => update('salary', value)} />
          <NumberField label="Meses Trabalhados" inputId={`${ids}-months`} value={values.months ?? ''} onChange={(value) => update('months', value)} step="any" placeholder="Ex: 15" />
          <SelectField label="Motivo do Desligamento" inputId={`${ids}-reason`} value={values.reason ?? 'sem-justa-causa'} onChange={(value) => update('reason', value)} options={[{ value: 'sem-justa-causa', label: 'Demissão Sem Justa Causa' }, { value: 'pedido', label: 'Pedido de Demissão' }]} />
        </>}
        {mode === 'horaextra' && <>
          <MoneyField label="Salário Base Mensal" inputId={`${ids}-salary`} value={values.salary ?? ''} onChange={(value) => update('salary', value)} />
          <div className={styles.fieldPair}>
            <NumberField label="Jornada Mensal" inputId={`${ids}-monthly-hours`} value={values.monthlyHours ?? '220'} onChange={(value) => update('monthlyHours', value)} placeholder="Ex: 220" />
            <NumberField label="Quantidade de Horas" inputId={`${ids}-hours`} value={values.hours ?? ''} onChange={(value) => update('hours', value)} step="any" placeholder="Ex: 10" />
          </div>
          <SelectField label="Percentual de Acréscimo" inputId={`${ids}-premium`} value={values.premium ?? '50'} onChange={(value) => update('premium', value)} options={[{ value: '50', label: '50% (Dias Úteis)' }, { value: '100', label: '100% (Domingos e Feriados)' }]} />
        </>}
        {mode === 'fatorr' && <>
          <MoneyField label="Receita Bruta Anual (Últimos 12 meses)" inputId={`${ids}-revenue`} value={values.revenue ?? ''} onChange={(value) => update('revenue', value)} />
          <MoneyField label="Folha de Pagamento Anual (Inclui Pró-labore)" inputId={`${ids}-payroll`} value={values.payroll ?? ''} onChange={(value) => update('payroll', value)} />
          <SelectField label="Profissão / Atividade" inputId={`${ids}-activity`} value={values.activity ?? activities[0]!} onChange={(value) => update('activity', value)} options={activities.map((activity) => ({ value: activity, label: activity }))} />
        </>}
      </div>
      <ShareActions url={shareUrl} title={`Simulação de ${modes.find((item) => item.id === mode)?.label}`} text="Confira esta estimativa simplificada da Kapitalis." />
    </form>
  )

  const right = (
    <div className={styles.dashboard} data-tool-mode={mode}>
      <div className={styles.heroMetric} role="status" aria-live="polite">
        <span>{resultLabel || modes.find((item) => item.id === mode)?.label}</span>
        <strong>{resultValue}</strong>
        <p>{status}</p>
      </div>
      {mode === 'fatorr' && factorRResult && (
        <div className={styles.threshold} data-reached={factorRResult.thresholdReached}>
          <span>Sinalização do simulador legado</span>
          <strong>{factorRResult.thresholdReached ? 'Anexo III' : 'Anexo V'}</strong>
          <span>Parâmetro de 28% {factorRResult.thresholdReached ? 'atingido' : 'não atingido'}</span>
        </div>
      )}
      {segments.length > 0 && <InteractiveBreakdownRing segments={segments} centerLabel={mode === 'fatorr' ? 'Fator R' : 'Total'} />}
      <BreakdownRows segments={segments} />
      {mode === 'rescisao' && terminationResult && (
        <p className={styles.contextValue}>FGTS acumulado usado na estimativa da multa: <strong>{money.format(terminationResult.fgtsAccumulated)}</strong></p>
      )}
      {hasInput && <p className={styles.estimateNote}>{note}</p>}
      {!hasInput && <p className={styles.emptyNote}>O resultado e a composição aparecerão aqui conforme os campos forem informados.</p>}
    </div>
  )

  return <FinancialToolShell ariaLabel="Área de simulação complementar" headingId={headingId} left={left} right={right} leftClassName={styles.left} rightClassName={styles.right} stableHeight />
}
