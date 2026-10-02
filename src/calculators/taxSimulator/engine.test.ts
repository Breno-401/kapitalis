import { describe, expect, it } from 'vitest'
import { calculateTaxSimulation, type TaxSimulationInput } from './engine'

const base: TaxSimulationInput = {
  monthlyRevenue: '10000',
  rbt12: '120000',
  annualRevenue: '120000',
  profitMargin: '15',
  activity: 'services-iii',
  ordinarySimplesScenario: true,
  pastInitialYear: true,
  accrualBasis: true,
  singleAnnexRevenue: true,
}

describe('tax simulator', () => {
  it('uses Annex III nominal rate and deduction instead of the published legacy shortcut', () => {
    const result = calculateTaxSimulation(base)
    expect(result.simples).toMatchObject({ status: 'ready', monthlyCents: 60000, annualCents: 720000, effectiveRate: 0.06, band: 1 })
    expect(result.presumido).toMatchObject({ status: 'ready', monthlyCents: 113300, annualCents: 1359600 })
    expect(result.real).toMatchObject({ status: 'ready', monthlyCents: 128500, annualCents: 1542000 })
    expect(result.lowestEstimatedCost).toBe('simples')
  })

  it('uses the audited simplified Lucro Presumido breakdown for services', () => {
    const result = calculateTaxSimulation(base).presumido
    expect(result).toMatchObject({
      status: 'ready',
      monthlyCents: 113300,
      annualCents: 1359600,
      breakdown: [
        { key: 'irpj', monthlyCents: 48000 },
        { key: 'csll', monthlyCents: 28800 },
        { key: 'pis', monthlyCents: 6500 },
        { key: 'cofins', monthlyCents: 30000 },
      ],
    })
  })

  it('uses the audited simplified Lucro Real margin formula and keeps annual totals reproducible', () => {
    const result = calculateTaxSimulation({ ...base, annualRevenue: '120000', profitMargin: '15' }).real
    expect(result).toMatchObject({
      status: 'ready',
      monthlyCents: 128500,
      annualCents: 1542000,
      effectiveRate: 0.1285,
      breakdown: [
        { key: 'irpj', monthlyCents: 22500 },
        { key: 'csll', monthlyCents: 13500 },
        { key: 'pis', monthlyCents: 16500 },
        { key: 'cofins', monthlyCents: 76000 },
      ],
    })
  })

  it('applies the legacy additional IRPJ threshold to the estimated monthly tax base', () => {
    const result = calculateTaxSimulation({ ...base, annualRevenue: '1200000' }).presumido
    expect(result.status).toBe('ready')
    if (result.status !== 'ready') return
    expect(result.monthlyCents).toBe(1253000)
    expect(result.breakdown.find(({ key }) => key === 'irpj')?.monthlyCents).toBe(600000)
  })

  it('leaves a regime pending until its required legacy inputs are available', () => {
    const result = calculateTaxSimulation({ ...base, annualRevenue: '', activity: '' })
    expect(result.presumido).toMatchObject({ status: 'pending' })
    expect(result.real).toMatchObject({ status: 'pending' })
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

  it('holds the first twelve months, cash basis and mixed Annex revenue for separate apuração', () => {
    expect(calculateTaxSimulation({ ...base, pastInitialYear: false }).simples).toMatchObject({ status: 'pending', reason: expect.stringContaining('12 primeiros meses') })
    expect(calculateTaxSimulation({ ...base, accrualBasis: false }).simples).toMatchObject({ status: 'pending', reason: expect.stringContaining('caixa') })
    expect(calculateTaxSimulation({ ...base, singleAnnexRevenue: false }).simples).toMatchObject({ status: 'pending', reason: expect.stringContaining('mais de um anexo') })
  })
})
