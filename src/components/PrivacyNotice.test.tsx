import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PrivacyNotice, PRIVACY_NOTICE_STORAGE_KEY } from './PrivacyNotice'

beforeEach(() => {
  window.localStorage.clear()
})

describe('aviso de privacidade', () => {
  it('explica o processamento local sem pedir consentimento de cookies', () => {
    render(<PrivacyNotice />)

    expect(screen.getByText(/processados no seu navegador/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Entendi' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Saiba mais' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /aceitar|recusar|preferências/i })).toBeNull()
    expect(screen.getByText(/só entram na URL se você escolher compartilhar/i))
      .toBeTruthy()
  })

  it('expõe os detalhes e os fecha pelo teclado', () => {
    render(<PrivacyNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Saiba mais' }))
    const details = screen.getByRole('dialog', { name: 'Privacidade e uso de dados' })
    expect(details.textContent).toMatch(/não são gravados no armazenamento local/)
    expect(details.textContent).toMatch(/só entram na URL/)
    expect(details.textContent).toMatch(/não usa cookies, pixels ou analytics/)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Privacidade e uso de dados' })).toBeNull()
  })

  it('guarda somente o fechamento do aviso no navegador', () => {
    render(<PrivacyNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(screen.queryByRole('complementary', { name: 'Aviso de privacidade' })).toBeNull()
    expect(window.localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY)).toBe('true')
  })
})
