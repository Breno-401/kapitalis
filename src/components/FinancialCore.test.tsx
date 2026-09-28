import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FinancialCore } from './FinancialCore'

describe('Kapitalis financial core visual', () => {
  it('one_financial_scene_changes_state_without_changing_its_sources', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)

    const core = container.querySelector('[data-financial-core]')
    expect(core?.getAttribute('data-state')).toBe('visibilidade')
    const nodes = Array.from(
      container.querySelectorAll('[data-financial-node]'),
    ).map((node) => node.textContent?.trim())
    expect(nodes).toHaveLength(6)
    expect(nodes).toEqual(
      expect.arrayContaining([
        'Kapitalis',
        'Bancos',
        'Vendas',
        'Notas',
        'Folha',
        'Despesas',
      ]),
    )
  })

  it('kapitalis_brand_asset_replaces_the_invented_center_letter', () => {
    const { container } = render(<FinancialCore state="entradas" />)

    expect(container.querySelector('[data-kapitalis-brandmark]')?.getAttribute('href'))
      .toBe('/assets/kapitalis-logo-original.png')
    expect(container.querySelector('[data-kapitalis-brandmark]')?.closest('svg')?.getAttribute('viewBox'))
      .toBe('360 40 800 790')
    expect(container.querySelector('.centerMark')).toBeNull()
    expect(container.querySelector('[data-financial-node="Kapitalis"]'))
      .toBeTruthy()
  })

  it('chapters_activate_the_financial_elements_their_copy_describes', () => {
    const { container, rerender } = render(<FinancialCore state="entradas" />)
    const core = () => container.querySelector('[data-financial-core]')

    expect(core()?.querySelectorAll('[data-source-active="true"]')).toHaveLength(5)
    expect(core()?.querySelector('[data-flow="source-to-core"]')?.getAttribute('data-active'))
      .toBe('true')

    rerender(<FinancialCore state="organizacao" />)
    expect(core()?.querySelector('[data-ring="organization"]')?.getAttribute('data-active'))
      .toBe('true')
    expect(core()?.querySelector('[data-flow="convergence"]')?.getAttribute('data-active'))
      .toBe('true')

    rerender(<FinancialCore state="visibilidade" />)
    expect(
      Array.from(core()?.querySelectorAll('[data-financial-insight]') ?? []).map(
        (node) => node.getAttribute('data-financial-insight'),
      ),
    ).toEqual(['Fluxo de caixa', 'Compromissos', 'Previsibilidade'])
    expect(core()?.querySelectorAll('[data-insight-active="true"]')).toHaveLength(3)

    rerender(<FinancialCore state="decisao" />)
    expect(core()?.querySelector('[data-output="next-step"]')?.getAttribute('data-active'))
      .toBe('true')
  })

  it('organization_connects_the_core_to_conciliation_and_closing_nodes', () => {
    const { container } = render(<FinancialCore state="organizacao" />)
    const core = container.querySelector('[data-financial-core]')
    const nodes = Array.from(core?.querySelectorAll('[data-organization-node]') ?? [])

    expect(nodes.map((node) => node.textContent?.trim())).toEqual([
      'Conciliação',
      'Fechamento',
    ])
    expect(nodes.every((node) => node.getAttribute('data-active') === 'true'))
      .toBe(true)
    expect(core?.querySelectorAll('[data-flow="organization"]')).toHaveLength(2)
    expect(core?.querySelectorAll('[data-flow="organization"][data-active="true"]'))
      .toHaveLength(2)
  })

  it('decision_highlights_folha_and_notas_and_links_the_core_to_a_real_whatsapp_cta', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const core = container.querySelector('[data-financial-core]')
    const emphasizedSources = Array.from(
      core?.querySelectorAll('[data-decision-source="true"]') ?? [],
    ).map((source) => source.getAttribute('data-source'))

    expect(emphasizedSources).toEqual(['notas', 'folha'])
    expect(core?.querySelectorAll('[data-decision-flow="true"]')).toHaveLength(2)
    expect(core?.querySelector('[data-financial-signal="decision-link"]')
      ?.getAttribute('d')).toBe('M 320 438 L 320 546')

    const nextStep = container.querySelector<HTMLAnchorElement>('[data-next-step-link]')
    expect(nextStep?.getAttribute('href')).toBe('https://wa.me/5527998829289')
    expect(nextStep?.getAttribute('target')).toBe('_blank')
    expect(nextStep?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(nextStep?.textContent).toMatch(/Próximo passo/i)
  })

  it('decision_signal_stays_clear_of_the_kapitalis_wordmark', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const wordmark = container.querySelector('[data-core-wordmark]')
    const signal = container.querySelector('[data-financial-signal="decision"]')
    const wordmarkBaseline = Number(wordmark?.getAttribute('y'))
    const signalYs = Array.from(
      signal?.getAttribute('d')?.matchAll(/(?:M|L)\s*-?\d+(?:\.\d+)?\s+(-?\d+(?:\.\d+)?)/g) ?? [],
    ).map((match) => Number(match[1]))

    expect(wordmarkBaseline).toBe(407)
    expect(signalYs.length).toBeGreaterThan(1)
    expect(Math.min(...signalYs)).toBeGreaterThan(wordmarkBaseline + 20)
  })

  it('decision_output_sits_below_the_wordmark_and_connects_to_the_signal', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const output = container.querySelector('[data-output="next-step"]')

    expect(output?.querySelector('rect')?.getAttribute('y')).toBe('546')
    expect(output?.querySelector('text')?.getAttribute('y')).toBe('567')
    expect(
      container
        .querySelector('[data-financial-signal="decision-link"]')
        ?.getAttribute('d'),
    ).toBe('M 320 438 L 320 546')
  })

  it('visibility_labels_do_not_collide_with_source_node_labels', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)
    const insightY = Array.from(
      container.querySelectorAll('[data-insight-active="true"]'),
    ).map((label) => Number(label.getAttribute('y')))
    const fixedLabelY = Array.from(
      container.querySelectorAll('[data-source-label]'),
    ).map((label) => Number(label.getAttribute('y')) + 49)

    expect(insightY).toHaveLength(3)
    expect(fixedLabelY).toHaveLength(5)
    expect(
      insightY.every((y) =>
        fixedLabelY.every((fixedY) => Math.abs(y - fixedY) >= 20),
      ),
    ).toBe(true)
  })

  it('visibility_mutes_source_names_and_sequences_only_supported_insights', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)
    const core = container.querySelector('[data-financial-core]')
    const labels = ['Fluxo de caixa', 'Compromissos', 'Previsibilidade']

    expect(
      Array.from(core?.querySelectorAll('[data-source-label]') ?? []).map((label) =>
        label.getAttribute('data-source-emphasis'),
      ),
    ).toEqual(Array(5).fill('muted'))
    expect(
      Array.from(core?.querySelectorAll('[data-insight-flow]') ?? []).map((flow) =>
        flow.getAttribute('data-insight-flow'),
      ),
    ).toEqual(labels)
    expect(
      Array.from(core?.querySelectorAll('[data-insight-point]') ?? []).map((point) =>
        point.getAttribute('data-insight-point'),
      ),
    ).toEqual(labels)
    expect(
      Array.from(core?.querySelectorAll('[data-financial-insight]') ?? []).map(
        (label) => label.getAttribute('data-insight-order'),
      ),
      ).toEqual(['0', '1', '2'])
  })

  it('visibility_removes_the_entire_indicators_branch', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)
    const core = container.querySelector('[data-financial-core]')

    expect(core?.querySelector('[data-financial-insight="Indicadores"]')).toBeNull()
    expect(core?.querySelector('[data-insight-flow="Indicadores"]')).toBeNull()
    expect(core?.querySelector('[data-insight-point="Indicadores"]')).toBeNull()
    expect(core?.querySelectorAll('[data-insight-flow]')).toHaveLength(3)
    expect(core?.querySelectorAll('[data-insight-point]')).toHaveLength(3)
  })

  it('visibility_does_not_render_the_orphaned_indicator_scaffold', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)
    const core = container.querySelector('[data-financial-core]')

    expect(
      core?.querySelector('path[d="M174 386h68l32-35h92l32 35h68"]'),
    ).toBeNull()
  })
})
