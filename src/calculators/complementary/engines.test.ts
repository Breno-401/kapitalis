import { describe, expect, it } from 'vitest'
import {
  calculateCltCost,
  calculateFactorR,
  calculateOvertime,
  calculatePartnerCompensation,
  calculateTermination,
} from './engines'

describe('legacy complementary calculator engines', () => {
  it('calculates partner compensation using total payroll and caps distributable profit at zero', () => {
    expect(calculatePartnerCompensation({ profit: '1000000', partnerCount: '2', compensationPerPartner: '200000' })).toEqual({
      status: 'ready', profit: 10000, totalCompensation: 4000, socialSecurity: 440,
      disbursement: 4440, distributableProfit: 5560,
    })
    expect(calculatePartnerCompensation({ profit: '1000', partnerCount: '2', compensationPerPartner: '200000' })?.distributableProfit).toBe(0)
  })

  it('preserves parseInt defaults for partner count and requires positive profit', () => {
    expect(calculatePartnerCompensation({ profit: '100', partnerCount: '0', compensationPerPartner: '0' })?.totalCompensation).toBe(0)
    expect(calculatePartnerCompensation({ profit: '0', partnerCount: '2', compensationPerPartner: '100' })).toBeNull()
  })

  it('calculates CLT cost from only the legacy salary, FGTS, INSS and provisions', () => {
    const lucro = calculateCltCost({ salary: '1000000', regime: 'lucro' })
    expect(lucro).toMatchObject({ status: 'ready', salary: 10000, fgts: 800 })
    expect(lucro?.employerSocialSecurity).toBeCloseTo(2780)
    expect(lucro?.thirteenthProvision).toBeCloseTo(10000 / 12)
    expect(lucro?.vacationProvision).toBeCloseTo(10000 / 12 * 1.3333333333333333)
    expect(calculateCltCost({ salary: '1000000', regime: 'simples' })?.employerSocialSecurity).toBe(0)
  })

  it('calculates termination using completed-month parsing and legacy proportional periods', () => {
    const result = calculateTermination({ salary: '30000', workedMonths: '13.8', reason: 'sem-justa-causa' })
    expect(result).toMatchObject({ workedMonths: 13, notice: 300, fgtsAccumulated: 312 })
    expect(result?.fgtsPenalty).toBeCloseTo(124.8)
    expect(result?.thirteenthSalary).toBe(25)
    expect(result?.vacationPay).toBeCloseTo(33.3325)
    expect(calculateTermination({ salary: '30000', workedMonths: '12', reason: 'pedido' })?.notice).toBe(0)
    expect(calculateTermination({ salary: '30000', workedMonths: '12', reason: 'pedido' })?.thirteenthSalary).toBe(300)
  })

  it('calculates overtime, DSR and default inputs without internal rounding', () => {
    expect(calculateOvertime({ salary: '220000', monthlyHours: '0', overtimeHours: '10', premiumPercent: '50' })).toEqual({
      status: 'ready', salary: 2200, monthlyHours: 220, overtimeHours: 10, premiumPercent: 50,
      regularHour: 10, overtimeHour: 15, overtimePay: 150, weeklyRest: 30,
      totalOvertimeCost: 180, salaryWithOvertime: 2380,
    })
    expect(calculateOvertime({ salary: '220000', monthlyHours: '220', overtimeHours: '-1', premiumPercent: '50' })).toBeNull()
  })

  it('compares the raw Fator R ratio with 28 percent and keeps activity informational', () => {
    const result = calculateFactorR({ revenue: '10000000', payroll: '2800000', activity: 'Advocacia' })
    expect(result).toMatchObject({ status: 'ready', revenue: 100000, payroll: 28000, thresholdReached: true, activity: 'Advocacia' })
    expect(result?.ratio).toBeCloseTo(28)
    expect(calculateFactorR({ revenue: '10000000', payroll: '2799999', activity: 'Advocacia' })?.thresholdReached).toBe(false)
    expect(calculateFactorR({ revenue: '0', payroll: '1', activity: 'Outros' })).toBeNull()
  })
})
