import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FinancialCore } from './FinancialCore'

describe('Kapitalis financial core visual', () => {
  it('one_financial_scene_changes_state_without_changing_its_sources', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)

    const core = container.querySelector('[data-financial-core]')
    expect(core?.getAttribute('data-state')).toBe('visibilidade')
    const nodes = Array.from(
      container.querySelectorAll('[data-financial-node]'),
    ).map((node) => node.textContent?.trim())
    expect(nodes).toHaveLength(6)
    expect(nodes).toEqual(
      expect.arrayContaining([
        'Kapitalis',
        'Bancos',
        'Vendas',
        'Notas',
        'Folha',
        'Despesas',
      ]),
    )
  })
})
