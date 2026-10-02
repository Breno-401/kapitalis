import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { getInitialTheme, THEME_STORAGE_KEY } from './theme'
import type { SiteTheme } from './theme'
import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

const navigation = [
  { href: '#sistema', label: 'Sistema' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#bpo', label: 'BPO Financeiro' },
  { href: '#conteudo', label: 'Ferramentas' },
  { href: '#contato', label: 'Contato' },
  { href: '#duvidas-frequentes', label: 'FAQ' },
] as const

type NavigationItem = (typeof navigation)[number]

type ThemeToggleProps = {
  theme: SiteTheme
  className: string
  onToggle: () => void
  compact?: boolean
}

function ThemeIcon() {
  return (
    <span className={styles.themeIcon} aria-hidden="true">
      <svg
        className={styles.moonIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
      <svg
        className={styles.sunIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </span>
  )
}

function ThemeToggle({ theme, className, onToggle, compact = false }: ThemeToggleProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      className={className}
      type="button"
      data-theme-toggle
      aria-label={`Mudar para o tema ${nextTheme === 'light' ? 'claro' : 'escuro'}`}
      aria-pressed={theme === 'light'}
      onClick={onToggle}
    >
      <ThemeIcon />
      {compact && <span>{nextTheme === 'light' ? 'Claro' : 'Escuro'}</span>}
    </button>
  )
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState<NavigationItem['href'] | null>(null)
  const [theme, setTheme] = useState<SiteTheme>(getInitialTheme)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const themeTransitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    return () => {
      if (themeTransitionTimeoutRef.current !== null) {
        window.clearTimeout(themeTransitionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  useEffect(() => {
    document.documentElement.dataset.mobileMenuOpen = String(isMenuOpen)
    window.dispatchEvent(
      new CustomEvent('kapitalis:mobile-menu-state', { detail: isMenuOpen }),
    )

    return () => {
      delete document.documentElement.dataset.mobileMenuOpen
    }
  }, [isMenuOpen])

  useEffect(() => {
    function updateScrollState() {
      const next = window.scrollY > 48
      setIsScrolled((current) => (current === next ? current : next))
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const targets = new Map<Element, NavigationItem['href']>()
    for (const { href } of navigation) {
      if (href === '#sistema') {
        document
          .querySelectorAll('[data-story-chapter]')
          .forEach((chapter) => targets.set(chapter, href))
        continue
      }

      const target = document.getElementById(href.slice(1))
      if (target) targets.set(target, href)
    }

    const visibility = new Map<Element, number>()
    targets.forEach((_href, target) => visibility.set(target, 0))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visibility.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          ),
        )

        let nextHref: NavigationItem['href'] | null = null
        let largestRatio = 0
        let nearestCenter = Number.POSITIVE_INFINITY
        const viewportCenter = window.innerHeight / 2

        visibility.forEach((ratio, target) => {
          if (ratio <= 0) return

          const bounds = target.getBoundingClientRect()
          const centerDistance =
            viewportCenter < bounds.top
              ? bounds.top - viewportCenter
              : viewportCenter > bounds.bottom
                ? viewportCenter - bounds.bottom
                : 0

          if (
            ratio > largestRatio ||
            (ratio === largestRatio && centerDistance < nearestCenter)
          ) {
            largestRatio = ratio
            nearestCenter = centerDistance
            nextHref = targets.get(target) ?? null
          }
        })

        setActiveHref((current) => (current === nextHref ? current : nextHref))
      },
      {
        rootMargin: '-44% 0px -48% 0px',
        threshold: [0, 0.05, 0.12],
      },
    )

    targets.forEach((_href, target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const railNode = railRef.current
    const indicatorNode = indicatorRef.current
    if (!railNode || !indicatorNode) return
    const rail = railNode as HTMLElement
    const indicator = indicatorNode as HTMLSpanElement
    let frame: number | null = null
    let disposed = false

    function measureIndicator() {
      if (!activeHref || (window.innerWidth <= 900 && !isMenuOpen)) {
        indicator.dataset.visible = 'false'
        return
      }

      const link = Array.from(rail.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .find((candidate) => candidate.getAttribute('href') === activeHref)
      if (!link) {
        indicator.dataset.visible = 'false'
        return
      }

      const railBounds = rail.getBoundingClientRect()
      const linkBounds = link.getBoundingClientRect()
      indicator.style.width = `${linkBounds.width}px`
      indicator.style.height = `${linkBounds.height}px`
      indicator.style.transform = `translate3d(${linkBounds.left - railBounds.left}px, ${linkBounds.top - railBounds.top}px, 0)`
      indicator.dataset.visible = 'true'
    }

    function scheduleMeasure() {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        measureIndicator()
      })
    }

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleMeasure)
    observer?.observe(rail)
    rail.querySelectorAll('a[href]').forEach((link) => observer?.observe(link))

    window.addEventListener('resize', scheduleMeasure)
    measureIndicator()
    void document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure()
    })

    return () => {
      disposed = true
      observer?.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [activeHref, isMenuOpen])

  function closeAfterNavigation() {
    if (!isMenuOpen) return
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  function changeTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    let reducedMotion = false

    try {
      reducedMotion =
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    } catch {
      // Theme changes still work when media queries are unavailable.
    }

    if (themeTransitionTimeoutRef.current !== null) {
      window.clearTimeout(themeTransitionTimeoutRef.current)
    }

    if (reducedMotion) delete root.dataset.themeTransitioning
    else root.dataset.themeTransitioning = 'true'
    root.dataset.theme = nextTheme
    setTheme(nextTheme)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The selected theme remains active for this page even if storage is unavailable.
    }

    if (!reducedMotion) {
      themeTransitionTimeoutRef.current = window.setTimeout(() => {
        delete root.dataset.themeTransitioning
        themeTransitionTimeoutRef.current = null
      }, 300)
    }
  }

  return (
    <header className={styles.header} data-scrolled={isScrolled}>
      <a className={styles.skipLink} href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <div className={styles.inner} data-reveal="text" data-reveal-initial data-entry="navbar">
        <a className={styles.brand} href="#inicio" aria-label="Kapitalis, início">
          <BrandMark
            className={styles.brandMark}
            height="2.8rem"
            width="2.8rem"
          />
          <span className={styles.brandName}>{site.shortName}</span>
        </a>

        <nav
          id="site-navigation"
          className={styles.navigation}
          aria-label="Navegação principal"
          data-open={isMenuOpen}
          ref={railRef}
        >
          <div className={styles.navigationInner}>
            <span
              aria-hidden="true"
              className={styles.activeIndicator}
              data-nav-indicator
              data-visible="false"
              ref={indicatorRef}
            />
            <ul className={styles.navigationList}>
              {navigation.map(({ href, label }) => (
                <li key={href}>
                  <a
                    aria-current={activeHref === href ? 'location' : undefined}
                    className={styles.navigationLink}
                    href={href}
                    onClick={closeAfterNavigation}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              aria-label="Conversar no WhatsApp (abre em nova aba)"
              className={styles.menuContactLink}
              data-mobile-contact
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeAfterNavigation}
            >
              Conversar no WhatsApp
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M4.5 10h10m-4-4 4 4-4 4" />
              </svg>
            </a>
            <div className={styles.mobileThemeControl}>
              <span>Tema</span>
              <ThemeToggle
                className={styles.themeToggleMobile}
                theme={theme}
                onToggle={changeTheme}
                compact
              />
            </div>
          </div>
        </nav>

        <a
          aria-label="Conversar no WhatsApp (abre em nova aba)"
          className={styles.contactLink}
          href={site.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Conversar no WhatsApp</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
            <path d="M4.5 10h10m-4-4 4 4-4 4" />
          </svg>
        </a>
        <ThemeToggle
          className={styles.themeToggleDesktop}
          theme={theme}
          onToggle={changeTheme}
        />

        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.menuGlyph}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  )
}
