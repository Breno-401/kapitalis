import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('ordem da landing Kapitalis', () => {
  it('coloca Reviews logo depois do Sistema e mantém FAQ perto do fechamento', () => {
    const { container } = render(<HomePage />)
    const topLevelSections = Array.from(container.querySelectorAll('main > section'))
    expect(topLevelSections.slice(0, 2).map((section) => section.id)).toEqual([
      'inicio',
      'avaliacoes',
    ])

    const selectors = [
      '#sistema',
      '#avaliacoes',
      '#servicos',
      '#bpo',
      '#conteudo',
      '#processo',
      '#duvidas-frequentes',
      'section[aria-labelledby="final-cta-title"]',
      '#contato',
    ]
    const orderedSections = selectors.map((selector) => container.querySelector(selector))

    expect(orderedSections.every(Boolean)).toBe(true)
    for (let index = 1; index < orderedSections.length; index += 1) {
      const previous = orderedSections[index - 1]!
      const current = orderedSections[index]!
      expect(
        previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })
})
