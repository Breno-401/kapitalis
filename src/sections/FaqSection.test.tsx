import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FaqSection } from './FaqSection'

const expectedQuestions = [
  'Posso misturar as contas da empresa com a minha conta pessoal?',
  'Quanto o MEI pode faturar por ano? Existe limite mensal?',
  'Preciso emitir nota fiscal de todas as minhas vendas e serviços?',
  'Posso retirar dinheiro da empresa para pagar minhas despesas pessoais?',
  'Como saber se estou pagando impostos demais?',
]

const expectedAnswers = [
  /Não pode haver confusão patrimonial\..*correta apuração dos resultados da empresa\./,
  /limite de faturamento anual de R\$ 81 mil por ano, e por mês R\$ 6\.750,00\..*sem planejamento\./,
  /Sim! A emissão da nota fiscal é fundamental.*garantindo mais segurança e transparência\./,
  /O dinheiro da empresa não deve ser tratado como dinheiro pessoal do sócio\..*problemas financeiros e contábeis\./,
  /O valor dos impostos depende de diversos fatores.*reduzir a carga tributária\./,
]

describe('FAQ section', () => {
  it('keeps every answer directly inside the matching question item', () => {
    const { container } = render(<FaqSection />)
    expect(screen.getByRole('heading', { level: 2, name: 'Dúvidas frequentes' })).toBeTruthy()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
    expect(buttons.map((button) => button.textContent?.trim().replace(/\s+/g, ' ')))
      .toEqual(expectedQuestions)

    const allControls = buttons.map((button) => button.getAttribute('aria-controls'))
    expect(allControls.every(Boolean)).toBe(true)
    expect(new Set(allControls).size).toBe(5)
    expect(container.querySelectorAll('[role="region"]')).toHaveLength(5)

    buttons.forEach((button, index) => {
      const item = button.closest('article')
      const heading = button.closest('h3')
      const answer = item?.querySelector<HTMLElement>('[role="region"]')
      expect(item).toBeTruthy()
      expect(answer?.id).toBe(allControls[index])
      expect(answer?.getAttribute('aria-labelledby')).toBe(button.id)
      expect(heading?.nextElementSibling).toBe(answer)
      expect(answer?.querySelector('h3')).toBeNull()
      expect(answer?.textContent).toMatch(expectedAnswers[index]!)
      expect(answer?.getAttribute('aria-hidden')).toBe(index === 0 ? 'false' : 'true')
      expect(answer?.hasAttribute('inert')).toBe(index !== 0)
    })

    expect(container.querySelectorAll('[aria-label="Perguntas frequentes"] > article [role="region"]')).toHaveLength(5)
  })

  it('opens the selected answer below its question and closes the previously open item', () => {
    render(<FaqSection />)
    const buttons = screen.getAllByRole('button')

    for (let index = 0; index < buttons.length; index += 1) {
      const button = screen.getByRole('button', { name: expectedQuestions[index] })
      fireEvent.click(button)

      expect(button.getAttribute('aria-expanded')).toBe('true')
      expect(button.parentElement?.nextElementSibling?.id).toBe(button.getAttribute('aria-controls'))
      expect(button.parentElement?.nextElementSibling?.getAttribute('aria-hidden')).toBe('false')
      expect(button.parentElement?.querySelector('[data-open="true"]')).toBeTruthy()

      buttons.forEach((otherButton, otherIndex) => {
        if (otherIndex === index) return
        expect(otherButton.getAttribute('aria-expanded')).toBe('false')
        expect(document.getElementById(otherButton.getAttribute('aria-controls')!)?.hasAttribute('inert')).toBe(true)
        expect(otherButton.parentElement?.querySelector('[data-open="false"]')).toBeTruthy()
      })
    }
  })

  it('keeps questions as focusable native buttons with unique answer controls', () => {
    render(<FaqSection />)
    const buttons = screen.getAllByRole('button')

    buttons.forEach((button) => {
      button.focus()
      expect(document.activeElement).toBe(button)
      expect(button.tagName).toBe('BUTTON')
      expect((button as HTMLButtonElement).type).toBe('button')
      expect(button.getAttribute('aria-controls')).toBeTruthy()
      expect(button.getAttribute('aria-expanded')).toMatch(/^(true|false)$/)
    })
  })
})
