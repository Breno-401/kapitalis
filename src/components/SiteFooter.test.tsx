import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { site } from '../data/site'
import { SiteFooter } from './SiteFooter'

describe('site footer', () => {
  it('keeps navigation, service, tool, location, and contact links available', () => {
    render(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')
    const navigation = within(footer).getByRole('navigation', { name: 'Navegação complementar' })
    expect(within(navigation).getByRole('link', { name: 'Ferramentas' }).getAttribute('href')).toBe('#conteudo')
    expect(within(navigation).getByRole('link', { name: 'FAQ' }).getAttribute('href')).toBe('#duvidas-frequentes')
    expect(within(navigation).getByRole('link', { name: 'Privacidade' })).toBeTruthy()
    expect(within(navigation).getByRole('link', { name: 'BPO Financeiro' }).getAttribute('href')).toBe('#bpo')
    expect(within(footer).getByText(site.locality)).toBeTruthy()
    expect(within(footer).getByRole('link', { name: site.phoneDisplay }).getAttribute('href')).toBe(`tel:${site.phoneE164}`)
    expect(within(footer).getByRole('link', { name: 'WhatsApp' }).getAttribute('href')).toBe(site.whatsappUrl)
    expect(within(footer).getByRole('link', { name: 'Instagram' })).toBeTruthy()
    expect(within(footer).getByRole('link', { name: 'Facebook' })).toBeTruthy()
  })

  it('usa a marca SVG com proporção preservada no rodapé', () => {
    render(<SiteFooter />)
    const logo = document.querySelector<SVGSVGElement>('footer svg')
    expect(logo?.getAttribute('viewBox')).toBe('525 236 486 432')
    expect(logo?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
    expect(logo?.querySelector('image')?.getAttribute('href')).toBe('/assets/kapitalis-logo-original.png')
  })
})
