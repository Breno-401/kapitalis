/** Values use decimal reais at the boundary and integer centavos inside the engine. */
export type TaxActivity = 'commerce' | 'industry' | 'services-iii' | 'services-unconfirmed' | ''

export type TaxSimulationInput = {
  monthlyRevenue: string
  rbt12: string
  annualRevenue?: string
  profitMargin?: string
  activity: TaxActivity
  ordinarySimplesScenario: boolean
  pastInitialYear: boolean
  singleAnnexRevenue: boolean
}

type PendingResult = { status: 'pending'; reason: string }
type InvalidResult = { status: 'invalid'; reason: string }
type ReadyResult = {
  status: 'ready'
  monthlyCents: number
  annualCents: number
  effectiveRate: number
  breakdown: TaxBreakdown[]
  band?: number
  nominalRate?: number
  deductionCents?: number
}

export type TaxBreakdown = {
  key: 'das' | 'irpj' | 'csll' | 'pis' | 'cofins'
  label: string
  monthlyCents: number
  annualCents: number
}

export type RegimeResult = PendingResult | InvalidResult | ReadyResult
export type TaxSimulationResult = {
  simples: RegimeResult
  presumido: RegimeResult
  real: RegimeResult
  lowestEstimatedCost: 'simples' | 'presumido' | 'real' | null
}

type Band = { maxCents: number; nominalBasisPoints: number; deductionCents: number }

// LC 123/2006, Anexos I–III, redação vigente para a apuração considerada.
// https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
const limits = [180000, 360000, 720000, 1800000, 3600000].map((value) => value * 100)
const tables: Record<'commerce' | 'industry' | 'services-iii', readonly Band[]> = {
  commerce: [
    [400, 0], [730, 5940], [950, 13860], [1070, 22500], [1430, 87300],
  ].map(([nominalBasisPoints, deduction], index) => ({ maxCents: limits[index]!, nominalBasisPoints, deductionCents: deduction * 100 })),
  industry: [
    [450, 0], [780, 5940], [1000, 13860], [1120, 22500], [1470, 85500],
  ].map(([nominalBasisPoints, deduction], index) => ({ maxCents: limits[index]!, nominalBasisPoints, deductionCents: deduction * 100 })),
  'services-iii': [
    [600, 0], [1120, 9360], [1350, 17640], [1600, 35640], [2100, 125640],
  ].map(([nominalBasisPoints, deduction], index) => ({ maxCents: limits[index]!, nominalBasisPoints, deductionCents: deduction * 100 })),
}

function toCents(value: string): number | null {
  const normalized = value.trim()
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const [reais, centavos = ''] = normalized.split('.')
  const result = Number(reais) * 100 + Number(centavos.padEnd(2, '0'))
  return Number.isSafeInteger(result) ? result : null
}

function pending(message: string): PendingResult {
  return { status: 'pending', reason: message }
}

function invalid(message: string): InvalidResult {
  return { status: 'invalid', reason: message }
}

function legacyEstimate(
  monthlyRevenue: number,
  components: { key: TaxBreakdown['key']; label: string; amount: number }[],
): ReadyResult {
  const total = components.reduce((sum, component) => sum + component.amount, 0)
  return {
    status: 'ready',
    monthlyCents: Math.round(total * 100),
    annualCents: Math.round(total * 12 * 100),
    effectiveRate: total / monthlyRevenue,
    breakdown: components.map(({ key, label, amount }) => ({
      key,
      label,
      monthlyCents: Math.round(amount * 100),
      annualCents: Math.round(amount * 12 * 100),
    })),
  }
}

function calculateLegacyPresumido(input: TaxSimulationInput): RegimeResult {
  const annualRevenueValue = input.annualRevenue?.trim() ?? ''
  const annualRevenueCents = annualRevenueValue ? toCents(annualRevenueValue) : null
  if (!annualRevenueValue) return pending('Informe o faturamento anual previsto para estimar o Lucro Presumido.')
  if (annualRevenueCents === null) return invalid('Revise o faturamento anual previsto.')
  if (annualRevenueCents === 0) return pending('Informe um faturamento anual maior que zero.')
  if (!input.activity) return pending('Escolha a atividade principal para estimar o Lucro Presumido.')

  const annualRevenue = annualRevenueCents / 100
  const monthlyRevenue = annualRevenue / 12
  const serviceActivity = input.activity === 'services-iii' || input.activity === 'services-unconfirmed'
  const irpjBase = monthlyRevenue * (serviceActivity ? 0.32 : 0.08)
  const csllBase = monthlyRevenue * (serviceActivity ? 0.32 : 0.12)
  const irpj = 0.15 * irpjBase + 0.10 * Math.max(irpjBase - 20000, 0)
  const csll = 0.09 * csllBase
  const pis = 0.0065 * monthlyRevenue
  const cofins = 0.03 * monthlyRevenue

  return legacyEstimate(monthlyRevenue, [
    { key: 'irpj', label: 'IRPJ', amount: irpj },
    { key: 'csll', label: 'CSLL', amount: csll },
    { key: 'pis', label: 'PIS', amount: pis },
    { key: 'cofins', label: 'COFINS', amount: cofins },
  ])
}

function calculateLegacyReal(input: TaxSimulationInput): RegimeResult {
  const annualRevenueValue = input.annualRevenue?.trim() ?? ''
  const annualRevenueCents = annualRevenueValue ? toCents(annualRevenueValue) : null
  if (!annualRevenueValue) return pending('Informe o faturamento anual previsto para estimar o Lucro Real.')
  if (annualRevenueCents === null) return invalid('Revise o faturamento anual previsto.')
  if (annualRevenueCents === 0) return pending('Informe um faturamento anual maior que zero.')

  const annualRevenue = annualRevenueCents / 100
  const monthlyRevenue = annualRevenue / 12
  const parsedMargin = Number.parseFloat(input.profitMargin ?? '')
  const margin = (Number.isFinite(parsedMargin) ? parsedMargin : 0) / 100
  const estimatedProfit = monthlyRevenue * margin
  const irpj = 0.15 * Math.max(estimatedProfit, 0) + 0.10 * Math.max(estimatedProfit - 20000, 0)
  const csll = 0.09 * Math.max(estimatedProfit, 0)
  const pis = 0.0165 * monthlyRevenue
  const cofins = 0.076 * monthlyRevenue

  return legacyEstimate(monthlyRevenue, [
    { key: 'irpj', label: 'IRPJ', amount: irpj },
    { key: 'csll', label: 'CSLL', amount: csll },
    { key: 'pis', label: 'PIS', amount: pis },
    { key: 'cofins', label: 'COFINS', amount: cofins },
  ])
}

export function calculateTaxSimulation(input: TaxSimulationInput): TaxSimulationResult {
  const monthlyCents = toCents(input.monthlyRevenue)
  const rbt12Cents = toCents(input.rbt12)
  let simples: RegimeResult

  if (monthlyCents === null || rbt12Cents === null) {
    simples = { status: 'invalid', reason: 'Informe receita do mês e RBT12 em reais, com até dois centavos.' }
  } else if (rbt12Cents === 0) {
    simples = { status: 'pending', reason: 'Início de atividade ou RBT12 zerado exige apuração específica no PGDAS-D.' }
  } else if (rbt12Cents > 480000000) {
    simples = { status: 'pending', reason: 'Receita acima do limite do Simples: enquadramento pendente de validação.' }
  } else if (rbt12Cents > 360000000) {
    simples = { status: 'pending', reason: 'Acima de R$ 3,6 milhões há sublimites de ICMS/ISS a validar.' }
  } else if (input.activity === 'services-unconfirmed' || !input.activity) {
    simples = { status: 'pending', reason: 'Confirme o anexo aplicável à atividade antes de estimar o DAS.' }
  } else if (!input.ordinarySimplesScenario) {
    simples = { status: 'pending', reason: 'Confirme que a empresa é optante e elegível ao Simples e que a receita não exige segregação especial.' }
  } else if (!input.pastInitialYear) {
    simples = { status: 'pending', reason: 'Nos 12 primeiros meses de atividade, a RBT12 deve ser proporcionalizada; cálculo pendente.' }
  } else if (!input.singleAnnexRevenue) {
    simples = { status: 'pending', reason: 'Receitas de mais de um anexo no mês exigem apuração separada por atividade.' }
  } else {
    const bandIndex = tables[input.activity].findIndex(({ maxCents }) => rbt12Cents <= maxCents)
    const band = tables[input.activity][bandIndex]!
    // PGDAS-D 8.1: ((RBT12 × alíquota nominal) − parcela a deduzir) / RBT12.
    const effectiveRate = (band.nominalBasisPoints / 10000) - (band.deductionCents / rbt12Cents)
    const estimatedMonthlyCents = Math.round(monthlyCents * effectiveRate)
    simples = {
      status: 'ready',
      monthlyCents: estimatedMonthlyCents,
      annualCents: estimatedMonthlyCents * 12,
      effectiveRate,
      breakdown: [{
        key: 'das',
        label: 'DAS estimado',
        monthlyCents: estimatedMonthlyCents,
        annualCents: estimatedMonthlyCents * 12,
      }],
      band: bandIndex + 1,
      nominalRate: band.nominalBasisPoints / 10000,
      deductionCents: band.deductionCents,
    }
  }

  const presumido = calculateLegacyPresumido(input)
  const real = calculateLegacyReal(input)
  return {
    simples,
    presumido,
    real,
    lowestEstimatedCost: simples.status === 'ready' && presumido.status === 'ready' && real.status === 'ready'
      ? simples.monthlyCents <= presumido.monthlyCents && simples.monthlyCents <= real.monthlyCents
        ? 'simples'
        : presumido.monthlyCents <= real.monthlyCents ? 'presumido' : 'real'
      : null,
  }
}
