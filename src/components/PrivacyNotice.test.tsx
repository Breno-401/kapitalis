import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { OPEN_PRIVACY_DETAILS_EVENT, PrivacyNotice } from './PrivacyNotice'

const consentCalls: unknown[][] = []

beforeEach(() => {
  window.localStorage.clear()
  consentCalls.length = 0
  Object.defineProperty(window, 'gtag', {
    configurable: true,
    value: (...args: unknown[]) => consentCalls.push(args),
  })
})

afterEach(() => {
  Reflect.deleteProperty(window, 'gtag')
})

describe('aviso de privacidade', () => {
  it('pede uma escolha explícita mesmo após o fechamento do aviso antigo', () => {
    window.localStorage.setItem('kapitalis-privacy-notice-dismissed', 'true')
    render(<PrivacyNotice />)

    expect(screen.getByRole('button', { name: 'Aceitar todos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rejeitar todos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Saiba mais' })).toBeTruthy()
  })

  it('registra e persiste o consentimento explícito para os quatro estados', () => {
    render(<PrivacyNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Aceitar todos' }))

    expect(consentCalls).toEqual([[
      'consent',
      'update',
      {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      },
    ]])
    expect(window.localStorage.getItem('kapitalis-tracking-consent')).toBe('granted')
    expect(screen.queryByRole('complementary', { name: 'Aviso de privacidade' })).toBeNull()
  })

  it('registra e persiste a rejeição de todos os estados', () => {
    render(<PrivacyNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar todos' }))

    expect(consentCalls).toEqual([[
      'consent',
      'update',
      {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ]])
    expect(window.localStorage.getItem('kapitalis-tracking-consent')).toBe('denied')
  })

  it('permite rever e modificar uma escolha pelo acesso de privacidade', () => {
    render(<PrivacyNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar todos' }))
    act(() => window.dispatchEvent(new Event(OPEN_PRIVACY_DETAILS_EVENT)))

    expect(screen.getByRole('dialog', { name: 'Privacidade e uso de dados' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar todos' }))

    expect(window.localStorage.getItem('kapitalis-tracking-consent')).toBe('denied')
    expect(consentCalls).toHaveLength(2)
    expect(consentCalls[1]).toEqual([
      'consent',
      'update',
      {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ])
  })

  it('explica o uso de GTM e Ads sem enviar valores das calculadoras ao dataLayer', () => {
    render(<PrivacyNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Saiba mais' }))
    const details = screen.getByRole('dialog', { name: 'Privacidade e uso de dados' })
    expect(details.textContent).toMatch(/Google Tag Manager/)
    expect(details.textContent).toMatch(/Google Ads/)
    expect(details.textContent).toMatch(/não são enviados.*nem incluídos no dataLayer/)
    expect(details.textContent).toMatch(/sinais.*sem cookies/)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Privacidade e uso de dados' })).toBeNull()
  })
})
