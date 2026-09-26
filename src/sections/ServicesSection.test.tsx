import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServicesSection } from './ServicesSection'

describe('audited service pillars', () => {
  it('selects one pillar and updates its description, activities and destination', () => {
    render(<ServicesSection />)

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: /BPO Financeiro/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain('Rotinas de pagar e receber')
    expect(screen.getByRole('link', { name: 'Explorar a Mesa Financeira' }).getAttribute('href')).toBe('#bpo')

    fireEvent.click(screen.getByRole('tab', { name: /Contabilidade/ }))
    expect(screen.getByRole('tabpanel').textContent).toContain('Abertura de empresa e regularização')
    expect(screen.getByRole('link', { name: 'Ver ferramentas da Kapitalis' }).getAttribute('href')).toBe('#conteudo')

    fireEvent.keyDown(screen.getByRole('tab', { name: /Contabilidade/ }), { key: 'End' })
    expect(
      screen.getByRole('tab', { name: /Tributário e empresarial/ }).getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toContain('Planejamento tributário')

    const activities = screen.getAllByRole('listitem')
      .map((item) => item.textContent?.replace(/^\d{2}/, '').trim())

    expect(activities).toEqual([
      'Planejamento tributário',
      'Consultoria empresarial',
      'Indicadores e precificação',
    ])
    expect(
      screen.queryByText(/soluções completas|excelência|resultados garantidos/i),
    ).toBeNull()
  })
})
