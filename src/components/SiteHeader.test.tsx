import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { site } from '../data/site'

type ObserverRecord = {
  callback: IntersectionObserverCallback
  targets: Element[]
}

function rectangle(left: number, top: number, width: number, height: number) {
  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

const approvedAnchors = [
  '#inicio',
  '#contexto',
  '#sistema',
  '#servicos',
  '#bpo',
  '#processo',
  '#conteudo',
  '#contato',
]

const expectedNavigation = [
  'Contexto',
  'Sistema',
  'Serviços',
  'BPO Financeiro',
  'Ferramentas',
  'Contato',
]

describe('site navigation', () => {
  it('mobile_menu_opens_and_closes_with_escape_and_returns_focus', () => {
    render(<App />)

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')

    menuButton.focus()
    fireEvent.click(menuButton)
    expect(menuButton.getAttribute('aria-expanded')).toBe('true')
    expect(menuButton.getAttribute('aria-label')).toBe('Fechar menu')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(menuButton.getAttribute('aria-label')).toBe('Abrir menu')
    expect(document.activeElement).toBe(menuButton)

    fireEvent.click(menuButton)
    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Serviços' }))
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menuButton)
  })

  it('navigation_links_target_existing_sections', () => {
    const { container } = render(<App />)
    const hrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map(
      (link) => link.getAttribute('href'),
    )

    expect(hrefs).toEqual(expect.arrayContaining(approvedAnchors))
    expect(hrefs).not.toContain('#')
    for (const href of hrefs) {
      expect(href).toBeTruthy()
      if (href) expect(container.querySelector(href)).toBeTruthy()
    }
  })

  it('home_renders_semantic_landmarks_and_one_h1', () => {
    render(<App />)

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('floating_pill_contains_navigation_contact_and_active_indicator', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    const header = screen.getByRole('banner')
    expect(
      within(navigation).getByRole('link', { name: 'Contexto' }).getAttribute('href'),
    ).toBe('#contexto')
    expect(
      within(navigation).getByRole('link', { name: 'Sistema' }).getAttribute('href'),
    ).toBe('#sistema')
    expect(
      within(header).getAllByRole('link', { name: 'Conversar no WhatsApp' }),
    ).toHaveLength(2)
    expect(
      within(header)
        .getAllByRole('link', { name: 'Conversar no WhatsApp' })
        .every((link) => link.getAttribute('href') === site.whatsappUrl),
    ).toBe(true)
    expect(document.querySelector('[data-nav-indicator]')).toBeTruthy()
  })

  it('navbar_brand_uses_the_previous_approved_original_asset_implementation', () => {
    render(<App />)

    const mark = document.querySelector<HTMLImageElement>(
      'header a[aria-label="Kapitalis, início"] img',
    )
    expect(mark?.getAttribute('src')).toBe('/assets/kapitalis-logo-original.png')
    expect(mark?.getAttribute('width')).toBe('96')
    expect(mark?.getAttribute('height')).toBe('64')
  })

  it('mobile_menu_has_only_the_five_requested_destinations_and_whatsapp_at_the_end', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    const links = within(navigation).getAllByRole('link')

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      ...expectedNavigation,
      'Conversar no WhatsApp',
    ])
    expect(links.at(-1)?.getAttribute('href')).toBe(site.whatsappUrl)
    expect(links.at(-1)?.hasAttribute('data-mobile-contact')).toBe(true)
  })

  it('active_indicator_tracks_the_current_link_when_the_mobile_menu_opens', () => {
    const observers: ObserverRecord[] = []
    const originalInnerWidth = window.innerWidth
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          observers.push({ callback, targets: [] })
        }

        observe(target: Element) {
          observers.at(-1)?.targets.push(target)
        }

        disconnect() {}
      },
    )
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    })
    const measureRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(
      function (this: HTMLElement) {
        if (this.id === 'site-navigation') return rectangle(10, 20, 200, 60)
        if (
          this instanceof HTMLAnchorElement &&
          this.closest('#site-navigation')
        ) {
          return rectangle(50, 25, 40, 40)
        }
        return rectangle(0, 0, 0, 0)
      },
      )

    try {
      render(<App />)
      const observer = observers.find((record) =>
        record.targets.some(
          (target) => (target as HTMLElement).dataset.storyId === 'entradas',
        ),
      )
      expect(observer).toBeDefined()
      const activeObserver = observer as ObserverRecord
      const firstChapter = activeObserver.targets.find(
        (target) => (target as HTMLElement).dataset.storyId === 'entradas',
      )
      expect(firstChapter).toBeDefined()

      act(() => {
        activeObserver.callback(
          [
            {
              target: firstChapter as Element,
              isIntersecting: true,
              intersectionRatio: 0.5,
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        )
      })

      const menuButton = screen.getByRole('button', { name: 'Abrir menu' })
      fireEvent.click(menuButton)
      expect(menuButton.getAttribute('aria-expanded')).toBe('true')
      expect(
        document.querySelector('#site-navigation a[href="#sistema"]')?.getAttribute(
          'aria-current',
        ),
      ).toBe('location')
      expect(
        measureRect.mock.contexts.map((context) => {
          const element = context as HTMLElement
          return element.id || element.tagName
        }),
      ).toContain('site-navigation')

      const indicator = document.querySelector<HTMLElement>(
        '[data-nav-indicator]',
      )
      expect(indicator?.dataset.visible).toBe('true')
      expect(indicator?.style.width).toBe('40px')
      expect(indicator?.style.height).toBe('40px')
      expect(indicator?.style.transform).toContain('translate3d(40px, 5px')
    } finally {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })
})
