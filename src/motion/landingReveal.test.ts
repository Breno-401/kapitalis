import { afterEach, describe, expect, it, vi } from 'vitest'
import { initLandingReveal } from './landingReveal'

function fixture() {
  document.body.innerHTML = `
    <nav data-reveal="text" data-reveal-initial></nav>
    <header data-reveal-group>
      <h2 data-reveal="text"></h2><p data-reveal="text"></p>
    </header>
    <article data-reveal="card"><button>Serviço</button></article>
    <figure data-reveal="image"><img alt="Editorial" /></figure>`
  return Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
}

function observerMock() {
  let notify: IntersectionObserverCallback = () => {}
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  const Observer = vi.fn(function (callback: IntersectionObserverCallback) {
    notify = callback
    return { observe, unobserve, disconnect }
  })
  vi.stubGlobal('IntersectionObserver', Observer)
  return {
    Observer, observe, unobserve, disconnect,
    enter(target: Element, isIntersecting = true) {
      notify([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('shared landing reveal', () => {
  it('arms before paint, starts the hero immediately and shares one observer for groups and cards', () => {
    const elements = fixture()
    const observer = observerMock()
    const dispose = initLandingReveal(document)
    expect(elements.map(element => element.dataset.revealState)).toEqual([
      'visible', 'pending', 'pending', 'pending', 'pending',
    ])
    expect(observer.Observer).toHaveBeenCalledTimes(1)
    expect(observer.Observer).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.08, rootMargin: '0px 0px -10% 0px',
    })
    expect(observer.observe.mock.calls.map(([element]) => element.tagName)).toEqual(['HEADER', 'ARTICLE', 'FIGURE'])
    dispose()
    expect(observer.disconnect).toHaveBeenCalled()
    expect(elements.every(element => !element.hasAttribute('data-reveal-state'))).toBe(true)
  })

  it('reveals the hierarchy together, unregisters it, and never replays on reverse scroll', () => {
    const elements = fixture()
    const observer = observerMock()
    const dispose = initLandingReveal(document)
    const headingGroup = document.querySelector('header')!
    observer.enter(headingGroup, false)
    expect(elements[1]?.dataset.revealState).toBe('pending')
    observer.enter(headingGroup)
    expect(elements.slice(1, 3).map(element => element.dataset.revealState)).toEqual(['visible', 'visible'])
    expect(observer.unobserve).toHaveBeenCalledWith(headingGroup)
    elements[1]!.dispatchEvent(Object.assign(new Event('animationend', { bubbles: true }), { animationName: 'landing-enter' }))
    observer.enter(headingGroup, false)
    observer.enter(headingGroup)
    expect(elements[1]?.dataset.revealState).toBe('complete')
    observer.enter(elements[3]!)
    observer.enter(elements[4]!)
    expect(observer.disconnect).toHaveBeenCalled()
    dispose()
  })

  it('does not hide content without an observer, or when setup fails partway through', () => {
    const elements = fixture()
    vi.stubGlobal('IntersectionObserver', undefined)
    initLandingReveal(document)()
    expect(elements.every(element => !element.hasAttribute('data-reveal-state'))).toBe(true)
    const observer = observerMock()
    observer.observe.mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw new Error('Observer failed') })
    initLandingReveal(document)()
    expect(elements.every(element => !element.hasAttribute('data-reveal-state'))).toBe(true)
    expect(observer.disconnect).toHaveBeenCalled()
  })

  it('shows everything immediately for reduced motion, including a live preference change', () => {
    const elements = fixture()
    const media = new EventTarget() as EventTarget & { matches: boolean }
    media.matches = true
    vi.stubGlobal('matchMedia', () => media)
    const observer = observerMock()
    const dispose = initLandingReveal(document)
    expect(observer.Observer).not.toHaveBeenCalled()
    expect(elements.every(element => !element.hasAttribute('data-reveal-state'))).toBe(true)
    dispose()
    media.matches = false
    const cleanup = initLandingReveal(document)
    expect(elements[3]?.dataset.revealState).toBe('pending')
    media.matches = true
    media.dispatchEvent(new Event('change'))
    expect(elements.every(element => element.dataset.revealState === 'complete')).toBe(true)
    media.matches = false
    media.dispatchEvent(new Event('change'))
    expect(elements.every(element => element.dataset.revealState === 'complete')).toBe(true)
    expect(observer.disconnect).toHaveBeenCalled()
    cleanup()
  })

  it('ignores inner media and diagram animation events without ending the entrance early', () => {
    const elements = fixture()
    const observer = observerMock()
    const dispose = initLandingReveal(document)
    const frame = elements[4]!
    observer.enter(frame)
    frame.querySelector('img')!.dispatchEvent(Object.assign(new Event('animationend', { bubbles: true }), { animationName: 'landing-image' }))
    frame.dispatchEvent(Object.assign(new Event('animationend', { bubbles: true }), { animationName: 'diagram-pulse' }))
    expect(frame.dataset.revealState).toBe('visible')
    frame.dispatchEvent(Object.assign(new Event('animationend', { bubbles: true }), { animationName: 'landing-enter' }))
    expect(frame.dataset.revealState).toBe('complete')
    dispose()
  })

  it('reveals a pending group immediately when keyboard focus reaches it', () => {
    const elements = fixture()
    const observer = observerMock()
    const dispose = initLandingReveal(document)
    document.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(elements[3]?.dataset.revealState).toBe('complete')
    expect(observer.unobserve).toHaveBeenCalledWith(elements[3])
    dispose()
  })
})
