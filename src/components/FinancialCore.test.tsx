import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FinancialCore } from './FinancialCore'

describe('Kapitalis financial core visual', () => {
  it.each(['entradas', 'organizacao', 'visibilidade', 'decisao'] as const)(
    'keeps all source nodes on the concentric outer circle in %s',
    (state) => {
      const { container } = render(<FinancialCore state={state} />)
      const orbit = container.querySelector('[data-orbit-ring="outer"]')!
      const cx = Number(orbit.getAttribute('cx'))
      const cy = Number(orbit.getAttribute('cy'))
      const radius = Number(orbit.getAttribute('r'))
      const logo = container.querySelector('[data-kapitalis-brandmark]')!.closest('svg')!
      expect(Number(logo.getAttribute('x')) + Number(logo.getAttribute('width')) / 2).toBe(cx)
      expect(Number(logo.getAttribute('y')) + Number(logo.getAttribute('height')) / 2).toBe(cy)
      for (const ring of container.querySelectorAll('[data-orbit-ring]')) {
        expect(Number(ring.getAttribute('cx'))).toBe(cx)
        expect(Number(ring.getAttribute('cy'))).toBe(cy)
      }

      const nodes = container.querySelectorAll('[data-financial-node][data-source]')
      expect(nodes).toHaveLength(5)
      for (const node of nodes) {
        const coordinates = node.getAttribute('transform')!.match(/^translate\(([^ ]+) ([^)]+)\)$/)!
        const x = Number(coordinates[1])
        const y = Number(coordinates[2])
        expect(Math.hypot(x - cx, y - cy)).toBeCloseTo(radius, 9)
        const line = container.querySelector(`[data-flow="source-to-core"][data-source="${node.getAttribute('data-source')}"]`)!
        expect(line.getAttribute('d')).toBe(`M ${x} ${y} L ${cx} ${cy}`)
      }
    },
  )

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
    expect(container.querySelector('[data-kapitalis-brandmark]')?.closest('svg')?.getAttribute('width'))
      .toBe('76')
    expect(container.querySelector('[data-kapitalis-brandmark]')?.closest('svg')?.getAttribute('height'))
      .toBe('76')
    expect(container.querySelector('.centerMark')).toBeNull()
    expect(container.querySelector('[data-financial-node="Kapitalis"]'))
      .toBeTruthy()
  })

  it('input_flows_run_from_each_source_toward_the_center', () => {
    const { container } = render(<FinancialCore state="entradas" />)
    const flows = Array.from(
      container.querySelectorAll('[data-flow="source-to-core"]'),
    )

    expect(flows).toHaveLength(5)
    expect(flows.every((flow) => flow.getAttribute('data-direction') === 'inward'))
      .toBe(true)
    expect(flows.every((flow) => flow.getAttribute('d')?.endsWith('320 320')))
      .toBe(true)
  })

  it('moves pulses along existing paths in each active system chapter', () => {
    const { container, rerender } = render(<FinancialCore state="entradas" />)
    const sourcePulses = () =>
      Array.from(container.querySelectorAll('[data-source-pulse]'))

    expect(sourcePulses()).toHaveLength(5)
    expect(
      sourcePulses().every((pulse) =>
        pulse.querySelector('animateMotion')?.getAttribute('repeatCount') ===
          'indefinite',
      ),
    ).toBe(true)
    expect(
      sourcePulses().every((pulse) =>
        pulse
          .querySelector('animateMotion mpath')
          ?.getAttribute('href')
          ?.startsWith('#kapitalis-source-flow-'),
      ),
    ).toBe(true)

    rerender(<FinancialCore state="organizacao" />)
    const organizationPulses = Array.from(
      container.querySelectorAll('[data-organization-pulse]'),
    )
    expect(organizationPulses).toHaveLength(2)
    expect(
      organizationPulses.every((pulse) =>
        pulse.querySelector('animateMotion')?.getAttribute('repeatCount') ===
          'indefinite',
      ),
    ).toBe(true)

    rerender(<FinancialCore state="visibilidade" />)
    const insightPulses = Array.from(
      container.querySelectorAll('[data-insight-pulse]'),
    )
    expect(insightPulses).toHaveLength(3)
    expect(
      insightPulses.every((pulse) =>
        pulse.querySelector('animateMotion')?.getAttribute('repeatCount') ===
          'indefinite',
      ),
    ).toBe(true)

    rerender(<FinancialCore state="decisao" />)
    expect(sourcePulses()).toHaveLength(2)
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
    expect(core()?.querySelectorAll('[data-flow="organization"][data-active="true"]'))
      .toHaveLength(2)

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
    const rings = Array.from(core?.querySelectorAll('[data-orbit-ring]') ?? [])

    expect(nodes.map((node) => node.textContent?.trim())).toEqual([
      'Conciliação',
      'Fechamento',
    ])
    expect(nodes.every((node) => node.getAttribute('data-active') === 'true'))
      .toBe(true)
    expect(core?.querySelectorAll('[data-flow="organization"]')).toHaveLength(2)
    expect(core?.querySelectorAll('[data-flow="organization"][data-active="true"]'))
      .toHaveLength(2)
    expect(rings.map((ring) => ring.getAttribute('data-orbit-ring'))).toEqual([
      'outer',
      'organization',
      'process',
    ])
    expect(rings.every((ring) => ring.getAttribute('data-active') === 'true'))
      .toBe(true)
    expect(core?.querySelector('[data-flow="convergence"]')).toBeNull()
  })

  it('visibility_insights_follow_a_directed_second_ring', () => {
    const { container } = render(<FinancialCore state="visibilidade" />)
    const flows = Array.from(
      container.querySelectorAll('[data-insight-flow]'),
    )

    expect(flows).toHaveLength(3)
    expect(flows.every((flow) => flow.getAttribute('data-orbit-flow') === 'clockwise'))
      .toBe(true)
    expect(flows.every((flow) => /A\s*174\s+174/.test(flow.getAttribute('d') ?? '')))
      .toBe(true)
  })

  it('decision_highlights_folha_and_notas_and_links_the_core_to_a_real_whatsapp_cta', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const core = container.querySelector('[data-financial-core]')
    const emphasizedSources = Array.from(
      core?.querySelectorAll('[data-decision-source="true"]') ?? [],
    ).map((source) => source.getAttribute('data-source'))

    expect(emphasizedSources).toEqual(['notas', 'folha'])
    expect(core?.querySelectorAll('[data-decision-flow="true"]')).toHaveLength(2)
    expect(core?.querySelectorAll('[data-flow="source-to-core"][data-active="true"]'))
      .toHaveLength(5)
    expect(core?.querySelectorAll('[data-orbit-ring][data-active="true"]')).toHaveLength(3)
    expect(core?.querySelectorAll('[data-financial-signal="decision-route"]'))
      .toHaveLength(1)
    expect(core?.querySelectorAll('[data-decision-pulse]')).toHaveLength(1)
    expect(core?.querySelector('[data-decision-pulse] animateMotion mpath')
      ?.getAttribute('href')).toBe('#kapitalis-decision-route')

    const nextStep = container.querySelector<HTMLAnchorElement>('[data-next-step-link]')
    expect(nextStep?.getAttribute('href')).toBe('https://wa.me/5527998829289')
    expect(nextStep?.getAttribute('target')).toBe('_blank')
    expect(nextStep?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(nextStep?.getAttribute('aria-label'))
      .toBe('Próximo passo (abre em nova aba)')
    expect(nextStep?.textContent?.trim()).toBe('Próximo passo')
    expect(core?.querySelector('[data-output="next-step"] text')).toBeNull()
  })

  it('decision_route_starts_at_the_core_and_reaches_next_step', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const wordmark = container.querySelector('[data-core-wordmark]')
    const signal = container.querySelector('[data-financial-signal="decision-route"]')
    const wordmarkBaseline = Number(wordmark?.getAttribute('y'))
    const route = signal?.getAttribute('d') ?? ''

    expect(wordmarkBaseline).toBe(407)
    expect(route.startsWith('M 320 381 C ')).toBe(true)
    expect(route.endsWith('320 590')).toBe(true)
  })

  it('decision_output_sits_below_the_wordmark_and_receives_the_route', () => {
    const { container } = render(<FinancialCore state="decisao" />)
    const output = container.querySelector('[data-output="next-step"]')
    const route = container.querySelector('[data-financial-signal="decision-route"]')

    expect(output?.querySelector('rect')?.getAttribute('y')).toBe('590')
    expect(output?.querySelector('text')).toBeNull()
    expect(route?.getAttribute('pathLength')).toBe('1')
    expect(route?.getAttribute('d')?.endsWith('320 590')).toBe(true)
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
