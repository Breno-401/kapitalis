import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('ordem da landing Kapitalis', () => {
  it('apresenta o Sistema, conteúdo principal, reviews e FAQ perto do fechamento', () => {
    const { container } = render(<HomePage />)
    const selectors = [
      '#sistema',
      '#servicos',
      '#bpo',
      '#conteudo',
      '#processo',
      '#avaliacoes',
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
