import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services } from '../data/services'
import { ServicesSection } from './ServicesSection'

describe('service flip cards', () => {
  it('renders the three confirmed service pillars without the previous tab interface', () => {
    render(<ServicesSection />)

    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.getAllByRole('article')).toHaveLength(services.length)

    for (const service of services) {
      const card = screen.getByRole('article', { name: service.title })
      expect(
        within(card).getByRole('button', { name: new RegExp(service.title) }).getAttribute('aria-expanded'),
      ).toBe('false')
      expect(within(card).queryByRole('link', { name: service.cta })).toBeNull()
    }

    expect(screen.queryByText(/soluções completas|excelência|resultados garantidos/i)).toBeNull()
  })

  it('reveals the back face on pointer and keyboard focus, and hides its CTA when closed', () => {
    render(<ServicesSection />)
    const card = screen.getByRole('article', { name: 'BPO Financeiro' })
    const trigger = within(card).getByRole('button', { name: /BPO Financeiro/ })

    fireEvent.pointerEnter(card, { pointerType: 'mouse' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(within(card).getByText('Contas a pagar e a receber')).not.toBeNull()
    expect(
      within(card).getByRole('link', { name: 'Explorar a Mesa Financeira' }).getAttribute('href'),
    ).toBe('#bpo')

    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: 'Explorar a Mesa Financeira' })).toBeNull()

    fireEvent.focus(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(within(card).getByRole('link', { name: 'Explorar a Mesa Financeira' })).not.toBeNull()

    fireEvent.blur(trigger, { relatedTarget: document.body })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: 'Explorar a Mesa Financeira' })).toBeNull()
  })

  it('toggles a service face by tap and retains its active state until tapped again', () => {
    render(<ServicesSection />)
    const card = screen.getByRole('article', { name: 'Contabilidade' })
    const trigger = within(card).getByRole('button', { name: /Contabilidade/ })

    fireEvent.pointerEnter(card, { pointerType: 'touch' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(
      within(card).getByRole('link', { name: 'Ver ferramentas da Kapitalis' }).getAttribute('href'),
    ).toBe('#conteudo')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: 'Ver ferramentas da Kapitalis' })).toBeNull()
  })
})
