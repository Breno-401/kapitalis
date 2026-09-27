/** Values use decimal reais at the boundary and integer centavos inside the engine. */
export type TaxActivity = 'commerce' | 'industry' | 'services-iii' | 'services-unconfirmed' | ''

export type TaxSimulationInput = {
  monthlyRevenue: string
  rbt12: string
  activity: TaxActivity
  ordinarySimplesScenario: boolean
}

type PendingResult = { status: 'pending'; reason: string }
type InvalidResult = { status: 'invalid'; reason: string }
type ReadyResult = {
  status: 'ready'
  monthlyCents: number
  annualCents: number
  effectiveRate: number
  band: number
  nominalRate: number
  deductionCents: number
}

export type RegimeResult = PendingResult | InvalidResult | ReadyResult
export type TaxSimulationResult = {
  simples: RegimeResult
  presumido: PendingResult
  real: PendingResult
  lowestEstimatedCost: null
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
      band: bandIndex + 1,
      nominalRate: band.nominalBasisPoints / 10000,
      deductionCents: band.deductionCents,
    }
  }

  return {
    simples,
    presumido: { status: 'pending', reason: 'Faltam receita trimestral por atividade, tributos locais, folha e regras aplicáveis ao período de 2026.' },
    real: { status: 'pending', reason: 'Faltam lucro fiscal apurado, ajustes, créditos de PIS/Cofins, tributos locais e folha.' },
    lowestEstimatedCost: null,
  }
}
