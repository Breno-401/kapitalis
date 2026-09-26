import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BpoSection } from './BpoSection'

describe('demonstrative BPO control desk', () => {
  it('bpo_tabs_switch_views_with_keyboard_navigation', () => {
    render(<BpoSection />)

    const tabs = screen.getByRole('tablist', { name: 'Vistas da Mesa de Controle' })
    expect(
      Array.from(tabs.children).every(
        (child) => child.getAttribute('role') === 'tab',
      ),
    ).toBe(true)
    const paymentsTab = within(tabs).getByRole('tab', { name: 'Pagamentos' })
    const receiptsTab = within(tabs).getByRole('tab', { name: 'Recebimentos' })
    expect(paymentsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Obrigação próxima')).toBeTruthy()

    fireEvent.keyDown(paymentsTab, { key: 'ArrowRight' })

    expect(receiptsTab.getAttribute('aria-selected')).toBe('true')
    expect(paymentsTab.getAttribute('aria-selected')).toBe('false')
    expect(document.activeElement).toBe(receiptsTab)
    expect(screen.getByText('Início da semana')).toBeTruthy()
    expect(screen.queryByText('Obrigação próxima')).toBeNull()
    expect(screen.getByRole('tabpanel', { name: 'Recebimentos' })).toBeTruthy()
  })

  it('bpo_each_view_has_its_own_metrics_and_operational_timeline', () => {
    render(<BpoSection />)

    expect(
      screen.getByRole('list', { name: 'Compromissos previstos no período' }),
    ).toBeTruthy()
    expect(screen.getAllByText('02 OUT').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Próximo vencimento').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: 'Recebimentos' }))
    expect(screen.getAllByText('Recebido').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)
    expect(screen.getByText(/10\.650/)).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Fechamento' }))
    expect(screen.getByText('Movimentos conciliados')).toBeTruthy()
    expect(screen.getByText('18 de 21')).toBeTruthy()
    expect(screen.getAllByText('Resumo do período').length).toBeGreaterThan(0)
  })

  it('bpo_disclaimer_stays_visible_across_views', () => {
    render(<BpoSection />)

    const controls = screen.getByRole('tablist', {
      name: 'Vistas da Mesa de Controle',
    })

    for (const view of ['Pagamentos', 'Recebimentos', 'Fechamento']) {
      fireEvent.click(within(controls).getByRole('tab', { name: view }))

      const notice = screen.getByText(
        'AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS',
      )
      expect(notice.hidden).toBe(false)
      expect(notice.closest('[hidden]')).toBeNull()
      expect(
        screen.getByRole('tabpanel', { name: view }),
      ).toBeTruthy()
    }
  })
})
