import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

const approvedAnchors = [
  '#inicio',
  '#contexto',
  '#sistema',
  '#servicos',
  '#bpo',
  '#processo',
  '#conteudo',
  '#contato',
]

describe('site navigation', () => {
  it('mobile_menu_opens_and_closes_with_escape_and_returns_focus', () => {
    render(<App />)

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')

    menuButton.focus()
    fireEvent.click(menuButton)
    expect(menuButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menuButton)

    fireEvent.click(menuButton)
    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Serviços' }))
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menuButton)
  })

  it('navigation_links_target_existing_sections', () => {
    const { container } = render(<App />)
    const hrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map(
      (link) => link.getAttribute('href'),
    )

    expect(hrefs).toEqual(expect.arrayContaining(approvedAnchors))
    expect(hrefs).not.toContain('#')
  })

  it('home_renders_semantic_landmarks_and_one_h1', () => {
    render(<App />)

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
