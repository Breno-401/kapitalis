import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProcessSection } from './ProcessSection'

const titles = [
  'CONHECER O SEU NEGÓCIO', 'ORGANIZAR A EMPRESA', 'CUIDAR DAS OBRIGAÇÕES',
  'ANALISAR OS NÚMEROS', 'ORIENTAR SUAS DECISÕES',
]
const descriptions = [
  'Antes de cuidar da contabilidade, entendemos como sua empresa funciona, quais são suas necessidades e quais desafios fazem parte da sua rotina.',
  'Organizamos as informações contábeis, fiscais, trabalhistas e tributárias para que sua empresa tenha uma base segura para seguir em frente.',
  'Acompanhamos de perto as rotinas contábeis, fiscais e trabalhistas, cuidando das apurações e das obrigações necessárias para manter sua empresa regularizada.',
  'A contabilidade não precisa ser apenas uma obrigação. Analisamos as informações da sua empresa para ajudar você a compreender resultados, custos, impostos e o desempenho do negócio.',
  'Com informações organizadas e uma visão completa do negócio, ajudamos você a identificar oportunidades, antecipar necessidades e planejar os próximos passos.',
]
const results = [
  'Uma contabilidade que conhece o seu negócio de verdade.',
  'Mais organização, segurança e tranquilidade para manter sua empresa em dia.',
  'A tranquilidade de saber que sua empresa está sendo acompanhada.',
  'Clareza para entender o que os números realmente dizem sobre sua empresa.',
  'Mais segurança para decidir hoje e planejar o crescimento de amanhã.',
]

afterEach(() => vi.unstubAllGlobals())

describe('manual conceptual chapters', () => {
  it('starts at 01 and selects one accessible panel in any order, preserving all client content', () => {
    const { container } = render(<ProcessSection />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true')
    for (const index of [0, 1, 2, 3, 4, 0, 3, 1, 4, 2]) {
      fireEvent.click(tabs[index]!)
      const panel = screen.getByRole('tabpanel')
      expect(within(panel).getByRole('heading').textContent).toBe(titles[index])
      expect(within(panel).getByText(descriptions[index]!)).toBeTruthy()
      expect(within(panel).getByText(results[index]!)).toBeTruthy()
      expect(within(panel).getByText('O QUE VOCÊ PASSA A TER')).toBeTruthy()
      expect(within(panel).getByLabelText(`Etapa ${index + 1} de 5`)).toBeTruthy()
      expect(panel.querySelector('svg circle')).toBeTruthy()
      expect(tabs[index]!.getAttribute('aria-controls')).toBe(panel.id)
      expect(panel.getAttribute('aria-labelledby')).toBe(tabs[index]!.id)
      expect(tabs.filter(tab => tab.getAttribute('aria-selected') === 'true')).toEqual([tabs[index]])
    }
    const ids = Array.from(container.querySelectorAll('[id]'), node => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not select chapters or reposition the viewport on scroll or button activation', () => {
    const scrollTo = vi.fn()
    const observer = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal('IntersectionObserver', observer)
    render(<ProcessSection />)
    fireEvent.click(screen.getAllByRole('tab')[3]!)
    for (const y of [0, 2000, 5000, 10000, 0]) {
      vi.stubGlobal('scrollY', y)
      fireEvent.scroll(window)
      fireEvent.resize(window)
      expect(screen.getByRole('tabpanel').textContent).toContain('ANALISAR OS NÚMEROS')
    }
    expect(scrollTo).not.toHaveBeenCalled()
    expect(observer).not.toHaveBeenCalled()
  })

  it('supports roving keyboard focus with arrows, Home and End', () => {
    render(<ProcessSection />)
    const tabs = screen.getAllByRole('tab')
    tabs[0]!.focus()
    for (const [key, index] of [['ArrowRight', 1], ['End', 4], ['ArrowRight', 0], ['ArrowLeft', 4], ['Home', 0]] as const) {
      fireEvent.keyDown(document.activeElement!, { key })
      expect(document.activeElement).toBe(tabs[index])
      expect(tabs[index]!.tabIndex).toBe(0)
      expect(tabs[index]!.getAttribute('aria-selected')).toBe('true')
      expect(screen.getByRole('tabpanel').textContent).toContain(titles[index])
    }
    expect(tabs.filter(tab => tab.tabIndex === 0)).toHaveLength(1)
  })

  it('keeps manual selection available with reduced motion and at mobile width', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    vi.stubGlobal('innerWidth', 375)
    render(<ProcessSection />)
    fireEvent.click(screen.getAllByRole('tab')[4]!)
    expect(screen.getByRole('tabpanel').textContent).toContain('ORIENTAR SUAS DECISÕES')
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  })
})
