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
      'CONHECER O SEU NEGÓCIO', 'ORGANIZAR A EMPRESA', 'CUIDAR DAS OBRIGAÇÕES',
      'ANALISAR OS NÚMEROS', 'ORIENTAR SUAS DECISÕES',
    ])
    expect(within(region).getAllByText('O QUE VOCÊ PASSA A TER')).toHaveLength(5)
    expect(within(region).getByText('Antes de cuidar da contabilidade, entendemos como sua empresa funciona, quais são suas necessidades e quais desafios fazem parte da sua rotina.')).toBeTruthy()
    expect(within(region).getByText('➡️ Uma contabilidade que conhece o seu negócio de verdade.')).toBeTruthy()
    expect(within(region).getByText('➡️ Mais organização, segurança e tranquilidade para manter sua empresa em dia.')).toBeTruthy()
    expect(within(region).getByText('➡️ A tranquilidade de saber que sua empresa está sendo acompanhada.')).toBeTruthy()
    expect(within(region).getByText('➡️ Clareza para entender o que os números realmente dizem sobre sua empresa.')).toBeTruthy()
    expect(within(region).getByText('➡️ Mais segurança para decidir hoje e planejar o crescimento de amanhã.')).toBeTruthy()
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

  it('restarts desktop entrances on return without cancelling the outgoing entrance', () => {
    render(<ProcessSection />)
    const articles = screen.getAllByRole('article')
    expect(articles[0]?.getAttribute('data-motion')).toBe('a')
    scrollToProgress(0.21)
    expect(articles[1]?.getAttribute('data-motion')).toBe('a')
    expect(articles[0]?.getAttribute('data-motion')).toBe('a')
    scrollToProgress(0.01)
    expect(articles[0]?.getAttribute('data-motion')).toBe('b')
    scrollToProgress(0.02)
    expect(articles[0]?.getAttribute('data-motion')).toBe('b')
  })

  it('reveals mobile chapters once at 20 percent intersection and cleans up the observer', () => {
    vi.stubGlobal('innerWidth', 402)
    let notify: IntersectionObserverCallback = () => {}
    const observe = vi.fn()
    const unobserve = vi.fn()
    const disconnect = vi.fn()
    const Observer = vi.fn(function (callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
      notify = callback
      expect(options.threshold).toBe(0.2)
      return { observe, unobserve, disconnect }
    })
    vi.stubGlobal('IntersectionObserver', Observer)
    const { unmount } = render(<ProcessSection />)
    const articles = screen.getAllByRole('article')
    expect(observe).toHaveBeenCalledTimes(5)
    expect(articles[0]?.getAttribute('data-viewport-reveal')).toBe('pending')
    act(() => {
      notify([{
        target: articles[0]!, isIntersecting: true, intersectionRatio: 0.2,
        time: 0, rootBounds: null, boundingClientRect: articles[0]!.getBoundingClientRect(),
        intersectionRect: articles[0]!.getBoundingClientRect(),
      }], {} as IntersectionObserver)
    })
    expect(articles[0]?.getAttribute('data-viewport-reveal')).toBe('visible')
    expect(unobserve).toHaveBeenCalledWith(articles[0])
    expect(articles[1]?.getAttribute('data-viewport-reveal')).toBe('pending')
    unmount()
    expect(disconnect).toHaveBeenCalled()
    expect(articles[1]?.hasAttribute('data-viewport-reveal')).toBe(false)
  })

  it('does not hide mobile content without IntersectionObserver or with reduced motion', () => {
    vi.stubGlobal('innerWidth', 402)
    vi.stubGlobal('IntersectionObserver', undefined)
    const { unmount } = render(<ProcessSection />)
    expect(screen.getAllByRole('article').every(e => !e.hasAttribute('data-viewport-reveal'))).toBe(true)
    unmount()
    reducedMotion = true
    const Observer = vi.fn()
    vi.stubGlobal('IntersectionObserver', Observer)
    render(<ProcessSection />)
    expect(Observer).not.toHaveBeenCalled()
    expect(screen.getAllByRole('article').every(e => !e.hasAttribute('data-viewport-reveal'))).toBe(true)
  })

  it('keeps all mobile chapters visible if observer initialization fails', () => {
    vi.stubGlobal('innerWidth', 402)
    vi.stubGlobal('IntersectionObserver', vi.fn(function () { throw new Error('Unavailable observer') }))
    render(<ProcessSection />)
    expect(screen.getAllByRole('article').every(e => !e.hasAttribute('data-viewport-reveal'))).toBe(true)
  })

  it('waits until the first desktop chapter enters the viewport before starting its reveal', () => {
    let notify: IntersectionObserverCallback = () => {}
    vi.stubGlobal('IntersectionObserver', vi.fn(function (callback: IntersectionObserverCallback) {
      notify = callback
      return { observe: vi.fn(), disconnect: vi.fn() }
    }))
    render(<ProcessSection />)
    const chapter = screen.getAllByRole('article')[0]!
    expect(chapter.hasAttribute('data-motion-wait')).toBe(true)
    expect(chapter.hasAttribute('data-motion')).toBe(false)
    act(() => {
      notify([{
        target: chapter, isIntersecting: true, intersectionRatio: 0.2, time: 0,
        rootBounds: null, boundingClientRect: chapter.getBoundingClientRect(),
        intersectionRect: chapter.getBoundingClientRect(),
      }], {} as IntersectionObserver)
    })
    expect(chapter.hasAttribute('data-motion-wait')).toBe(false)
    expect(chapter.dataset.motion).toBe('a')
  })

  it('does not expose a skipped chapter when a disconnected observer delivers a late entry', () => {
    const callbacks: IntersectionObserverCallback[] = []
    vi.stubGlobal('IntersectionObserver', vi.fn(function (callback: IntersectionObserverCallback) {
      callbacks.push(callback)
      return { observe: vi.fn(), disconnect: vi.fn() }
    }))
    render(<ProcessSection />)
    const chapter = screen.getAllByRole('article')[0]!
    scrollToProgress(0.21)
    act(() => callbacks[0]!([{
      target: chapter, isIntersecting: true, intersectionRatio: 0.2, time: 0,
      rootBounds: null, boundingClientRect: chapter.getBoundingClientRect(),
      intersectionRect: chapter.getBoundingClientRect(),
    }], {} as IntersectionObserver))
    expect(chapter.dataset.motion).toBeUndefined()
    expect(chapter.hasAttribute('data-motion-wait')).toBe(true)
  })
})
