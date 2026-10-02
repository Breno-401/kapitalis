export const complementaryModes = ['prolabore', 'clt', 'rescisao', 'horaextra', 'fatorr'] as const
export type ComplementaryMode = (typeof complementaryModes)[number]
export type ComplementaryValues = Record<string, string>

const fieldKeys: Record<ComplementaryMode, string[]> = {
  prolabore: ['profit', 'partners', 'compensation'],
  clt: ['salary', 'regime'],
  rescisao: ['salary', 'months', 'reason'],
  horaextra: ['salary', 'monthlyHours', 'hours', 'premium'],
  fatorr: ['revenue', 'payroll', 'activity'],
}

export const defaultValues: Record<ComplementaryMode, ComplementaryValues> = {
  prolabore: { profit: '', partners: '1', compensation: '' },
  clt: { salary: '', regime: 'simples' },
  rescisao: { salary: '', months: '', reason: 'sem-justa-causa' },
  horaextra: { salary: '', monthlyHours: '220', hours: '', premium: '50' },
  fatorr: { revenue: '', payroll: '', activity: 'Clínica Médica / Medicina' },
}

export function readSharedComplementary(search: string): { mode: ComplementaryMode; values: ComplementaryValues } {
  const params = new URLSearchParams(search)
  const candidate = params.get('tool')
  const mode = complementaryModes.includes(candidate as ComplementaryMode) ? candidate as ComplementaryMode : 'prolabore'
  const values = { ...defaultValues[mode] }
  for (const key of fieldKeys[mode]) {
    const value = params.get(key)
    if (value !== null) values[key] = value
  }
  if (mode === 'clt' && !['simples', 'lucro'].includes(values.regime ?? '')) values.regime = 'simples'
  if (mode === 'rescisao' && !['sem-justa-causa', 'pedido'].includes(values.reason ?? '')) values.reason = 'sem-justa-causa'
  if (mode === 'horaextra' && !['50', '100'].includes(values.premium ?? '')) values.premium = '50'
  return { mode, values }
}

export function createComplementaryUrl(mode: ComplementaryMode, values: ComplementaryValues, location: Location): string {
  const url = new URL(location.pathname, location.origin)
  url.searchParams.set('tool', mode)
  for (const key of fieldKeys[mode]) {
    const value = values[key]
    if (value) url.searchParams.set(key, value)
  }
  url.hash = 'conteudo'
  return url.toString()
}
