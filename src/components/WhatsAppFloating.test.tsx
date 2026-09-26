import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { site } from '../data/site'
import { WhatsAppFloating } from './WhatsAppFloating'

describe('floating WhatsApp contact', () => {
  it('uses the published WhatsApp destination and a clear accessible name', () => {
    render(<WhatsAppFloating />)

    const link = screen.getByRole('link', {
      name: 'Falar com a Kapitalis pelo WhatsApp',
    })
    expect(link.getAttribute('href')).toBe(site.whatsappUrl)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.querySelector('svg')).toBeTruthy()
  })

  it('moves out of the way while the mobile navigation is open', () => {
    render(<App />)

    const floatingLink = screen.getByRole('link', {
      name: 'Falar com a Kapitalis pelo WhatsApp',
    })
    const menuButton = screen.getByRole('button', { name: 'Abrir menu' })

    expect(floatingLink.getAttribute('aria-hidden')).toBe('false')
    fireEvent.click(menuButton)
    expect(floatingLink.getAttribute('aria-hidden')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu' }))
    expect(floatingLink.getAttribute('aria-hidden')).toBe('false')
  })
})
