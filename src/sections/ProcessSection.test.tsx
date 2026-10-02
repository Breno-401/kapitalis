import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProcessSection } from './ProcessSection'

describe('editorial process section', () => {
  let frames: FrameRequestCallback[]
  let reducedMotion: boolean
  let trackTop: number

  beforeEach(() => {
    frames = []
    reducedMotion = false
    trackTop = 2000
    vi.stubGlobal('innerWidth', 1440)
    vi.stubGlobal('innerHeight', 900)
    vi.stubGlobal('scrollY', 0)
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduced-motion') && reducedMotion,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return {
        top: trackTop - window.scrollY,
        height: this.hasAttribute('data-process-track') ? 4000 : 600,
        left: 0, right: 1000, bottom: 0, width: 1000, x: 0, y: 0,
        toJSON: () => ({}),
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function scrollToProgress(progress: number) {
    act(() => {
      vi.stubGlobal('scrollY', 2000 + progress * 3400)
      fireEvent.scroll(window)
      const callbacks = frames.splice(0)
      callbacks.forEach((callback) => callback(0))
    })
  }

  it('keeps all five conceptual stages and results accessible without tabs or a carousel', () => {
    render(<ProcessSection />)
    const region = screen.getByRole('region', { name: /Como uma rotina pode se organizar/ })
    expect(within(region).getAllByRole('article').map((article) =>
      within(article).getByRole('heading').textContent,
    )).toEqual([
      'Entender a operação', 'Organizar os dados', 'Assumir as rotinas',
      'Entregar informação', 'Acompanhar decisões',
    ])
    expect(within(region).getAllByText('O QUE VOCÊ PASSA A TER')).toHaveLength(5)
    expect(within(region).getByText('Uma visão organizada do período para apoiar decisões.')).toBeTruthy()
    expect(within(region).getByText('Mais contexto para planejar o que vem depois.')).toBeTruthy()
    expect(within(region).queryByRole('tab')).toBeNull()
    expect(within(region).queryByRole('button')).toBeNull()
    expect(within(region).getByText('Etapas conceituais')).toBeTruthy()
  })

  it('advances through every stage with real scroll and reverses when scrolling back', () => {
    render(<ProcessSection />)
    const articles = screen.getAllByRole('article')
    for (let index = 0; index < 5; index += 1) {
      scrollToProgress(index / 5 + 0.01)
      expect(articles[index]?.getAttribute('data-active')).toBe('true')
      expect(document.querySelector('[aria-current="step"]')?.textContent)
        .toContain(String(index + 1).padStart(2, '0'))
    }
    scrollToProgress(0.21)
    expect(articles[1]?.getAttribute('data-active')).toBe('true')
    expect(articles[4]?.getAttribute('data-active')).toBe('false')
  })

  it('clamps the active stage and advances the connecting line to the last index', () => {
    render(<ProcessSection />)
    scrollToProgress(-1)
    expect(screen.getAllByRole('article')[0]?.getAttribute('data-active')).toBe('true')
    scrollToProgress(0.4)
    expect((document.querySelector('[data-process-track]') as HTMLElement).style
      .getPropertyValue('--process-progress')).toBe('0.5000')
    scrollToProgress(2)
    expect(screen.getAllByRole('article')[4]?.getAttribute('data-active')).toBe('true')
    expect((document.querySelector('[data-process-track]') as HTMLElement).style
      .getPropertyValue('--process-progress')).toBe('1.0000')
  })

  it('uses a natural complete sequence on mobile', () => {
    vi.stubGlobal('innerWidth', 402)
    render(<ProcessSection />)
    expect(document.querySelector('[data-process-layout="static"]')).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(document.querySelector('[aria-current="step"]')).toBeNull()
  })

  it('keeps the complete sequence in static flow for reduced motion', () => {
    reducedMotion = true
    render(<ProcessSection />)
    expect(document.querySelector('[data-process-layout="static"]')).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(5)
    scrollToProgress(0.8)
    expect(document.querySelector('[aria-current="step"]')).toBeNull()
  })

  it('recalculates the layout when resized from desktop to mobile', () => {
    render(<ProcessSection />)
    expect(document.querySelector('[data-process-layout="sticky"]')).toBeTruthy()
    act(() => {
      vi.stubGlobal('innerWidth', 430)
      fireEvent(window, new Event('resize'))
    })
    expect(document.querySelector('[data-process-layout="static"]')).toBeTruthy()
  })

  it('remeasures the scroll start when content above the process changes height', () => {
    let onResize = () => {}
    const observed: Element[] = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { onResize = callback }
      observe(element: Element) { observed.push(element) }
      disconnect() {}
    })
    const { container } = render(<ProcessSection />)
    expect(observed).toContain(container)
    act(() => {
      trackTop = 2800
      onResize()
      vi.stubGlobal('scrollY', trackTop + 0.42 * 3400)
      fireEvent.scroll(window)
      frames.splice(0).forEach((callback) => callback(0))
    })
    expect(screen.getAllByRole('article')[2]?.getAttribute('data-active')).toBe('true')
  })
})
