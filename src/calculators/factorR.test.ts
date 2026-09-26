import { describe, expect, it } from 'vitest'
import { calculateFactorR } from './factorR'

describe('calculateFactorR', () => {
  it('parses Brazilian amounts and reaches the 28 percent marker', () => {
    expect(calculateFactorR('100.000,00', '28.000,00')).toMatchObject({
      percentage: 28,
      percentageLabel: '28,0%',
      thresholdReached: true,
    })
  })

  it('does not produce a ratio for invalid or non-positive revenue', () => {
    expect(calculateFactorR('', '100')).toBeNull()
    expect(calculateFactorR('0', '100')).toBeNull()
    expect(calculateFactorR('not a number', '100')).toBeNull()
    expect(calculateFactorR('100', '-1')).toBeNull()
  })
})
