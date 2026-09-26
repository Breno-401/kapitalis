import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BpoSection } from './BpoSection'

describe('demonstrative BPO control desk', () => {
  it('bpo_view_switches_operational_records', () => {
    render(<BpoSection />)

    const paymentsButton = screen.getByRole('button', { name: 'Pagamentos' })
    expect(paymentsButton.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Obrigação próxima')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Recebimentos' }))

    const receiptsButton = screen.getByRole('button', {
      name: 'Recebimentos',
    })
    expect(receiptsButton.getAttribute('aria-pressed')).toBe('true')
    expect(paymentsButton.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText('Entradas do início da semana')).toBeTruthy()
    expect(screen.queryByText('Obrigação próxima')).toBeNull()
  })

  it('bpo_disclaimer_stays_visible_across_views', () => {
    render(<BpoSection />)

    const controls = screen.getByRole('group', {
      name: 'Vistas da Mesa de Controle',
    })

    for (const view of ['Pagamentos', 'Recebimentos', 'Fechamento']) {
      fireEvent.click(within(controls).getByRole('button', { name: view }))

      const notice = screen.getByText(
        'AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS',
      )
      expect(notice.hidden).toBe(false)
      expect(notice.closest('[hidden]')).toBeNull()
      expect(
        screen.getByRole('region', { name: /Mesa de Controle Financeira/ }),
      ).toBeTruthy()
    }
  })
})
