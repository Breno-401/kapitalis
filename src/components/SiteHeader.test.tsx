import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  '#duvidas-frequentes',
  '#sistema',
  '#servicos',
  '#bpo',
  '#processo',
  '#conteudo',
  '#contato',
]

const expectedNavigation = [
  'Sistema',
  'Serviços',
  'BPO Financeiro',
  'Ferramentas',
  'Contato',
  'FAQ',
]

function mockMediaQueries(matches: Record<string, boolean>) {
  const originalMatchMedia = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((media: string) => ({
      matches: matches[media] ?? false,
      media,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    })
  }
}

beforeEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.themeTransitioning
})

describe('site navigation', () => {
  it('skip_link_keeps_its_semantic_destination_and_can_receive_focus', () => {
    render(<App />)

    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skipLink.getAttribute('href')).toBe('#conteudo-principal')

    skipLink.focus()
    expect(document.activeElement).toBe(skipLink)
  })

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
      within(navigation).getByRole('link', { name: 'FAQ' }).getAttribute('href'),
    ).toBe('#duvidas-frequentes')
    expect(
      within(navigation).getByRole('link', { name: 'Sistema' }).getAttribute('href'),
    ).toBe('#sistema')
    expect(
      within(header).getAllByRole('link', { name: 'Conversar no WhatsApp (abre em nova aba)' }),
    ).toHaveLength(2)
    expect(
      within(header)
        .getAllByRole('link', { name: 'Conversar no WhatsApp (abre em nova aba)' })
        .every((link) => link.getAttribute('href') === site.whatsappUrl),
    ).toBe(true)
    expect(document.querySelector('[data-nav-indicator]')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Mudar para o tema claro' })).toHaveLength(2)
  })

  it('theme_toggle_updates_the_page_and_persists_the_selected_theme', () => {
    render(<App />)

    const themeButtons = screen.getAllByRole('button', {
      name: 'Mudar para o tema claro',
    })
    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(themeButtons[0]!)

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('kapitalis-theme')).toBe('light')
    expect(
      screen.getAllByRole('button', { name: 'Mudar para o tema escuro' }),
    ).toHaveLength(2)
  })

  it('uses_the_system_light_preference_when_no_manual_choice_exists', () => {
    const restoreMatchMedia = mockMediaQueries({
      '(prefers-color-scheme: light)': true,
    })

    try {
      render(<App />)
      expect(document.documentElement.dataset.theme).toBe('light')
    } finally {
      restoreMatchMedia()
    }
  })

  it('prefers_the_saved_theme_over_the_system_preference', () => {
    const restoreMatchMedia = mockMediaQueries({
      '(prefers-color-scheme: light)': true,
    })
    window.localStorage.setItem('kapitalis-theme', 'dark')

    try {
      render(<App />)
      expect(document.documentElement.dataset.theme).toBe('dark')
    } finally {
      restoreMatchMedia()
    }
  })

  it('does_not_add_a_theme_transition_when_reduced_motion_is_requested', () => {
    const restoreMatchMedia = mockMediaQueries({
      '(prefers-reduced-motion: reduce)': true,
    })

    try {
      render(<App />)
      fireEvent.click(
        screen.getAllByRole('button', { name: 'Mudar para o tema claro' })[0]!,
      )

      expect(document.documentElement.dataset.theme).toBe('light')
      expect(document.documentElement.hasAttribute('data-theme-transitioning')).toBe(
        false,
      )
    } finally {
      restoreMatchMedia()
    }
  })

  it('navbar_brand_uses_the_shared_full_seal_mark', () => {
    render(<App />)

    const brand = document.querySelector<HTMLAnchorElement>(
      'header a[aria-label="Kapitalis, início"]',
    )
    expect(brand?.querySelector('svg')?.getAttribute('viewBox')).toBe('360 40 800 790')
    expect(brand?.querySelector('image')?.getAttribute('href')).toBe('/assets/kapitalis-logo-original.png')
    expect(brand?.textContent?.trim()).toBe('Kapitalis')
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
    expect(within(navigation).getByText('Tema')).toBeTruthy()
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

  it('repositions_the_active_indicator_after_a_window_resize', () => {
    const observers: ObserverRecord[] = []
    const originalInnerWidth = window.innerWidth
    const originalRequestAnimationFrame = window.requestAnimationFrame
    let linkLeft = 50
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
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
    })
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        callback(0)
        return 1
      }),
    })
    const measureRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.id === 'site-navigation') return rectangle(10, 20, 900, 60)
        if (
          this instanceof HTMLAnchorElement &&
          this.closest('#site-navigation')
        ) {
          return rectangle(linkLeft, 25, 80, 40)
        }
        return rectangle(0, 0, 0, 0)
      })

    try {
      render(<App />)
      const observer = observers.find((record) =>
        record.targets.some(
          (target) => (target as HTMLElement).dataset.storyId === 'entradas',
        ),
      )
      const storyEntry = observer?.targets.find(
        (target) => (target as HTMLElement).dataset.storyId === 'entradas',
      )
      expect(storyEntry).toBeDefined()

      act(() => {
        observer?.callback(
          [
            {
              target: storyEntry as Element,
              isIntersecting: true,
              intersectionRatio: 0.5,
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        )
      })

      const indicator = document.querySelector<HTMLElement>(
        '[data-nav-indicator]',
      )
      expect(indicator?.dataset.visible).toBe('true')
      expect(indicator?.style.transform).toContain('translate3d(40px, 5px')

      linkLeft = 130
      act(() => window.dispatchEvent(new Event('resize')))

      expect(indicator?.style.transform).toContain('translate3d(120px, 5px')
      expect(measureRect).toHaveBeenCalled()
    } finally {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        value: originalRequestAnimationFrame,
      })
    }
  })
})
