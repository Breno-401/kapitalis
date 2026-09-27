import { describe, expect, it } from 'vitest'
import { calculateTaxSimulation, type TaxSimulationInput } from './engine'

const base: TaxSimulationInput = {
  monthlyRevenue: '10000',
  rbt12: '120000',
  activity: 'services-iii',
  ordinarySimplesScenario: true,
}

describe('tax simulator', () => {
  it('uses Annex III nominal rate and deduction instead of the published legacy shortcut', () => {
    const result = calculateTaxSimulation(base)
    expect(result.simples).toMatchObject({ status: 'ready', monthlyCents: 60000, annualCents: 720000, effectiveRate: 0.06, band: 1 })
    expect(result.presumido.status).toBe('pending')
    expect(result.real.status).toBe('pending')
    expect(result.lowestEstimatedCost).toBeNull()
  })

  it('keeps the effective rate continuous across the first Annex III band', () => {
    const at = calculateTaxSimulation({ ...base, rbt12: '180000', monthlyRevenue: '15000' })
    const above = calculateTaxSimulation({ ...base, rbt12: '180000.01', monthlyRevenue: '15000' })
    expect(at.simples).toMatchObject({ status: 'ready', monthlyCents: 90000, band: 1 })
    expect(above.simples).toMatchObject({ status: 'ready', monthlyCents: 90000, band: 2 })
  })

  it('applies the verified Annex I and II tables and rounds money to cents', () => {
    const commerce = calculateTaxSimulation({ ...base, activity: 'commerce', rbt12: '360000', monthlyRevenue: '12345.67' })
    const industry = calculateTaxSimulation({ ...base, activity: 'industry', rbt12: '360000', monthlyRevenue: '12345.67' })
    expect(commerce.simples).toMatchObject({ status: 'ready', monthlyCents: 69753, band: 2 })
    expect(industry.simples).toMatchObject({ status: 'ready', monthlyCents: 75926, band: 2 })
  })

  it('allows a zero month with positive RBT12 without inventing a tax', () => {
    expect(calculateTaxSimulation({ ...base, monthlyRevenue: '0' }).simples).toMatchObject({ status: 'ready', monthlyCents: 0, annualCents: 0 })
  })

  it.each(['-1', '12.345', 'Infinity', 'abc', ''])('rejects invalid currency input %s', (monthlyRevenue) => {
    expect(calculateTaxSimulation({ ...base, monthlyRevenue }).simples.status).toBe('invalid')
  })

  it('holds startup, sublimit and eligibility cases for validation', () => {
    for (const rbt12 of ['0', '3600000.01', '4800000.01']) {
      expect(calculateTaxSimulation({ ...base, rbt12 }).simples.status).toBe('pending')
    }
  })

  it('does not assume Annex III or ordinary revenue from a generic service label', () => {
    expect(calculateTaxSimulation({ ...base, activity: 'services-unconfirmed' }).simples.status).toBe('pending')
    expect(calculateTaxSimulation({ ...base, ordinarySimplesScenario: false }).simples).toMatchObject({ status: 'pending', reason: expect.stringContaining('optante') })
  })
})
