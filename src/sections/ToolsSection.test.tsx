import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toolGroups } from '../data/tools'
import { ToolsSection } from './ToolsSection'

describe('tools directory', () => {
  it('keeps all seven audited tools in their tax and people categories', () => {
    render(<ToolsSection />)

    const names = toolGroups.flatMap((group) => group.tools.map((tool) => tool.name))
    expect(names).toHaveLength(7)
    for (const name of [
      'Simulador Tributário 360º',
      'Calculadora de Pró-labore',
      'Calculadora de Custo CLT',
      'Calculadora de Rescisão',
      'Calculadora de Hora Extra',
      'Calculadora Simples Nacional',
      'Calculadora Fator R',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeTruthy()
    }
    expect(screen.getByRole('heading', { name: 'Tributário' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Pessoas e folha' })).toBeTruthy()
  })

  it('links each tool to a verified published destination without pretending to calculate locally', () => {
    render(<ToolsSection />)

    for (const tool of toolGroups.flatMap((group) => group.tools)) {
      const link = screen.getByRole('link', {
        name: `Abrir ${tool.name} no site oficial`,
      })
      expect(link.getAttribute('href')).toBe(tool.destination.href)
      expect(link.getAttribute('href')).not.toBe('#')
      expect(tool.destination.state).toMatch(/single-page/)
    }
    expect(screen.getByText(/não têm uma URL própria/i)).toBeTruthy()
  })
})
