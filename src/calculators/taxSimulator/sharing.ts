import type { TaxActivity, TaxSimulationInput } from './engine'

const activities: TaxActivity[] = ['commerce', 'industry', 'services-iii', 'services-unconfirmed', '']
export type TaxRegime = 'simples' | 'presumido' | 'real'

export type SharedTaxSimulation = {
  input: TaxSimulationInput
  regime: TaxRegime
  annualRevenue: string
  profitMargin: string
  revenueBasis: 'unset' | 'competencia' | 'caixa'
}

export function readSharedSimulation(search: string): SharedTaxSimulation {
  const params = new URLSearchParams(search)
  const candidate = params.get('atividade') ?? ''
  const regime = params.get('regime')
  return {
    input: {
      monthlyRevenue: params.get('mensal') ?? '',
      rbt12: params.get('rbt12') ?? '',
      activity: activities.includes(candidate as TaxActivity) ? candidate as TaxActivity : '',
      ordinarySimplesScenario: params.get('cenarioPadrao') === '1',
      pastInitialYear: params.get('empresa12m') === '1',
      accrualBasis: params.get('competencia') === '1',
      singleAnnexRevenue: params.get('anexoUnico') === '1',
    },
    regime: regime === 'presumido' || regime === 'real' ? regime : 'simples',
    annualRevenue: params.get('faturamentoAnual') ?? '',
    profitMargin: params.get('margemLucro') ?? '15',
    revenueBasis: params.get('competencia') === '1' ? 'competencia' : params.get('baseReceita') === 'caixa' ? 'caixa' : 'unset',
  }
}

export function createSimulationUrl(simulation: SharedTaxSimulation, location: Location): string {
  const url = new URL(location.pathname, location.origin)
  const { input } = simulation
  if (input.monthlyRevenue) url.searchParams.set('mensal', input.monthlyRevenue)
  if (input.rbt12) url.searchParams.set('rbt12', input.rbt12)
  if (input.activity) url.searchParams.set('atividade', input.activity)
  if (input.ordinarySimplesScenario) url.searchParams.set('cenarioPadrao', '1')
  if (input.pastInitialYear) url.searchParams.set('empresa12m', '1')
  if (input.accrualBasis) url.searchParams.set('competencia', '1')
  if (input.singleAnnexRevenue) url.searchParams.set('anexoUnico', '1')
  if (simulation.regime !== 'simples') url.searchParams.set('regime', simulation.regime)
  if (simulation.annualRevenue) url.searchParams.set('faturamentoAnual', simulation.annualRevenue)
  if (simulation.profitMargin) url.searchParams.set('margemLucro', simulation.profitMargin)
  if (simulation.revenueBasis === 'caixa') url.searchParams.set('baseReceita', 'caixa')
  url.hash = 'conteudo'
  return url.toString()
}
