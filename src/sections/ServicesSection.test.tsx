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
      new URL(within(card).getByRole('link', { name: /BPO Financeiro.*WhatsApp/i }).getAttribute('href')!).searchParams.get('text'),
    ).toBe(services[0].whatsappMessage)

    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: /BPO Financeiro.*WhatsApp/i })).toBeNull()

    fireEvent.focus(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(within(card).getByRole('link', { name: /BPO Financeiro.*WhatsApp/i })).not.toBeNull()

    fireEvent.blur(trigger, { relatedTarget: document.body })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: /BPO Financeiro.*WhatsApp/i })).toBeNull()
  })

  it('toggles a service face by tap and retains its active state until tapped again', () => {
    render(<ServicesSection />)
    const card = screen.getByRole('article', { name: 'Contabilidade' })
    const trigger = within(card).getByRole('button', { name: /Contabilidade/ })

    fireEvent.pointerEnter(card, { pointerType: 'touch' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const link = within(card).getByRole('link', { name: /Contabilidade.*WhatsApp/i })
    expect(new URL(link.getAttribute('href')!).searchParams.get('text')).toBe(services[1].whatsappMessage)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')

    fireEvent.pointerDown(within(card).getByText(services[1].description, { selector: 'p' }), { pointerType: 'touch' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(card).queryByRole('link', { name: /Contabilidade.*WhatsApp/i })).toBeNull()
  })

  it('provides one accessible WhatsApp link per confirmed service and no circular close control', () => {
    render(<ServicesSection />)

    for (const service of services) {
      const card = screen.getByRole('article', { name: service.title })
      fireEvent.click(within(card).getByRole('button', { name: new RegExp(service.title) }))

      const link = within(card).getByRole('link', { name: new RegExp(`${service.title}.*WhatsApp.*nova aba`, 'i') })
      const destination = new URL(link.getAttribute('href')!)
      expect(destination.origin + destination.pathname).toBe('https://wa.me/5527998829289')
      expect(destination.searchParams.get('text')).toBe(service.whatsappMessage)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      expect(within(card).queryByRole('button', { name: /voltar/i })).toBeNull()
    }
  })
})
