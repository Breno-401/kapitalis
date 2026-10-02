export type LegacyEstimate<T> = T & { status: 'ready' }

export type PartnerCompensationResult = LegacyEstimate<{
  profit: number
  totalCompensation: number
  socialSecurity: number
  disbursement: number
  distributableProfit: number
}>

export type CltCostResult = LegacyEstimate<{
  salary: number
  fgts: number
  employerSocialSecurity: number
  thirteenthProvision: number
  vacationProvision: number
  totalMonthlyCost: number
}>

export type TerminationResult = LegacyEstimate<{
  salary: number
  workedMonths: number
  fgtsAccumulated: number
  thirteenthSalary: number
  vacationPay: number
  notice: number
  fgtsPenalty: number
  total: number
}>

export type OvertimeResult = LegacyEstimate<{
  salary: number
  monthlyHours: number
  overtimeHours: number
  premiumPercent: number
  regularHour: number
  overtimeHour: number
  overtimePay: number
  weeklyRest: number
  totalOvertimeCost: number
  salaryWithOvertime: number
}>

export type FactorRResult = LegacyEstimate<{
  revenue: number
  payroll: number
  ratio: number
  thresholdReached: boolean
  activity: string
}>

/** Legacy money inputs are masked strings whose digits represent cents. */
export function parseLegacyMoney(value: string): number {
  return Number(value.replace(/\D/g, '')) / 100 || 0
}

export function calculatePartnerCompensation(input: {
  profit: string
  partnerCount: string
  compensationPerPartner: string
}): PartnerCompensationResult | null {
  const profit = parseLegacyMoney(input.profit)
  if (!(profit > 0)) return null

  const partnerCount = Number.parseInt(input.partnerCount, 10) || 1
  const totalCompensation = parseLegacyMoney(input.compensationPerPartner) * partnerCount
  const socialSecurity = totalCompensation * 0.11
  const disbursement = totalCompensation + socialSecurity
  const distributableProfit = Math.max(0, profit - disbursement)

  return { status: 'ready', profit, totalCompensation, socialSecurity, disbursement, distributableProfit }
}

export function calculateCltCost(input: {
  salary: string
  regime: 'simples' | 'lucro'
}): CltCostResult | null {
  const salary = parseLegacyMoney(input.salary)
  if (!(salary > 0)) return null

  const fgts = salary * 0.08
  const employerSocialSecurity = input.regime === 'lucro' ? salary * 0.278 : 0
  const thirteenthProvision = salary / 12
  const vacationProvision = salary / 12 + salary / 12 / 3
  const totalMonthlyCost = salary + fgts + employerSocialSecurity + thirteenthProvision + vacationProvision

  return {
    status: 'ready', salary, fgts, employerSocialSecurity,
    thirteenthProvision, vacationProvision, totalMonthlyCost,
  }
}

export function calculateTermination(input: {
  salary: string
  workedMonths: string
  reason: 'sem-justa-causa' | 'pedido'
}): TerminationResult | null {
  const salary = parseLegacyMoney(input.salary)
  const workedMonths = Number.parseInt(input.workedMonths, 10) || 0
  if (!(salary > 0) || !(workedMonths > 0)) return null

  const fgtsAccumulated = salary * 0.08 * workedMonths
  const proportionalMonths = workedMonths % 12 || 12
  const thirteenthSalary = salary / 12 * proportionalMonths
  const vacationPay = salary / 12 * proportionalMonths * 1.3333
  const withoutJustCause = input.reason === 'sem-justa-causa'
  const notice = withoutJustCause ? salary : 0
  const fgtsPenalty = withoutJustCause ? fgtsAccumulated * 0.4 : 0
  const total = salary + notice + thirteenthSalary + vacationPay + fgtsPenalty

  return {
    status: 'ready', salary, workedMonths, fgtsAccumulated,
    thirteenthSalary, vacationPay, notice, fgtsPenalty, total,
  }
}

export function calculateOvertime(input: {
  salary: string
  monthlyHours: string
  overtimeHours: string
  premiumPercent: string
}): OvertimeResult | null {
  const salary = parseLegacyMoney(input.salary)
  if (!(salary > 0)) return null

  const monthlyHours = Number.parseFloat(input.monthlyHours) || 220
  const overtimeHours = Number.parseFloat(input.overtimeHours) || 0
  const premiumPercent = Number.parseFloat(input.premiumPercent) || 50
  if (overtimeHours < 0) return null

  const regularHour = salary / monthlyHours
  const overtimeHour = regularHour + regularHour * premiumPercent / 100
  const overtimePay = overtimeHour * overtimeHours
  const weeklyRest = overtimePay / 25 * 5
  const totalOvertimeCost = overtimePay + weeklyRest

  return {
    status: 'ready', salary, monthlyHours, overtimeHours, premiumPercent,
    regularHour, overtimeHour, overtimePay, weeklyRest, totalOvertimeCost,
    salaryWithOvertime: salary + totalOvertimeCost,
  }
}

export function calculateFactorR(input: {
  revenue: string
  payroll: string
  activity: string
}): FactorRResult | null {
  const revenue = parseLegacyMoney(input.revenue)
  const payroll = parseLegacyMoney(input.payroll)
  if (!(revenue > 0) || payroll < 0) return null

  const ratio = payroll / revenue * 100
  return { status: 'ready', revenue, payroll, ratio, thresholdReached: ratio >= 28, activity: input.activity }
}
