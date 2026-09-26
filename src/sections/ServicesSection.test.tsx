import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServicesSection } from './ServicesSection'

describe('audited service pillars', () => {
  it('services_show_three_audited_pillars', () => {
    render(<ServicesSection />)

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual([
      'BPO Financeiro',
      'Contabilidade',
      'Tributário e empresarial',
    ])

    const activities = screen
      .getAllByRole('listitem')
      .map((item) => item.textContent?.trim())

    expect(activities).toEqual(
      expect.arrayContaining([
        'Contas a pagar e a receber',
        'Conciliação financeira',
        'Fluxo de caixa',
        'Relatórios',
        'Departamento pessoal e folha',
        'Simples Nacional, Lucro Presumido e Lucro Real',
        'Planejamento tributário',
        'Indicadores e precificação',
      ]),
    )
    expect(
      screen.queryByText(/soluções completas|excelência|resultados garantidos/i),
    ).toBeNull()
  })
})
