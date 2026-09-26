export type FactorRResult = {
  percentage: number
  percentageLabel: string
  thresholdReached: boolean
}

function parseAmount(value: string | number): number {
  if (typeof value === 'number') return value

  const trimmed = value.trim()
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed

  return Number(normalized)
}

/**
 * Calculates only the payroll-to-revenue ratio described by LC 123/2006,
 * art. 18, §§ 5-J and 5-K. It does not classify an activity or estimate tax.
 */
export function calculateFactorR(
  revenue: string | number,
  payroll: string | number,
): FactorRResult | null {
  const revenueAmount = parseAmount(revenue)
  const payrollAmount = parseAmount(payroll)

  if (
    !Number.isFinite(revenueAmount) ||
    !Number.isFinite(payrollAmount) ||
    revenueAmount <= 0 ||
    payrollAmount < 0
  ) {
    return null
  }

  const rawPercentage = (payrollAmount / revenueAmount) * 100
  const percentage = Math.round(rawPercentage * 10) / 10

  return {
    percentage,
    percentageLabel: `${percentage.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`,
    thresholdReached: rawPercentage >= 28,
  }
}
