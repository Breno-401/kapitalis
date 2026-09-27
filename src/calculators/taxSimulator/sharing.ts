import type { TaxActivity, TaxSimulationInput } from './engine'

const activities: TaxActivity[] = ['commerce', 'industry', 'services-iii', 'services-unconfirmed', '']

export function readSharedSimulation(search: string): TaxSimulationInput {
  const params = new URLSearchParams(search)
  const candidate = params.get('atividade') ?? ''
  return {
    monthlyRevenue: params.get('mensal') ?? '',
    rbt12: params.get('rbt12') ?? '',
    activity: activities.includes(candidate as TaxActivity) ? candidate as TaxActivity : '',
    ordinarySimplesScenario: params.get('cenarioPadrao') === '1',
  }
}

export function createSimulationUrl(input: TaxSimulationInput, location: Location): string {
  const url = new URL(location.pathname, location.origin)
  if (input.monthlyRevenue) url.searchParams.set('mensal', input.monthlyRevenue)
  if (input.rbt12) url.searchParams.set('rbt12', input.rbt12)
  if (input.activity) url.searchParams.set('atividade', input.activity)
  if (input.ordinarySimplesScenario) url.searchParams.set('cenarioPadrao', '1')
  url.hash = 'conteudo'
  return url.toString()
}
