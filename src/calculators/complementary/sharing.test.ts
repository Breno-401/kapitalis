import { describe, expect, it } from 'vitest'
import { createComplementaryUrl, defaultValues, readSharedComplementary, type ComplementaryMode } from './sharing'

const samples: Record<ComplementaryMode, Record<string, string>> = {
  prolabore: { profit: '1000000', partners: '2', compensation: '200000' },
  clt: { salary: '1000000', regime: 'lucro' },
  rescisao: { salary: '300000', months: '13', reason: 'pedido' },
  horaextra: { salary: '220000', monthlyHours: '200', hours: '10', premium: '100' },
  fatorr: { revenue: '10000000', payroll: '2800000', activity: 'Advocacia' },
}

describe('complementary calculator sharing', () => {
  it.each(Object.entries(samples))('round trips only fields for %s', (mode, sample) => {
    const currentMode = mode as ComplementaryMode
    const values = { ...defaultValues[currentMode], ...sample }
    const sharedUrl = new URL(createComplementaryUrl(currentMode, values, new URL('https://example.test/ferramentas?old=1#old') as unknown as Location))
    const restored = readSharedComplementary(sharedUrl.search)

    expect(restored).toEqual({ mode: currentMode, values })
    expect(sharedUrl.searchParams.get('tool')).toBe(currentMode)
    for (const field of Object.keys(samples).flatMap((key) => Object.keys(samples[key as ComplementaryMode]))) {
      if (Object.hasOwn(sample, field)) continue
      expect(sharedUrl.searchParams.has(field)).toBe(false)
    }
  })
})
