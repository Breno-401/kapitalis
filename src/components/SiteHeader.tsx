import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

const navigation = [
  { href: '#contexto', label: 'Contexto' },
  { href: '#sistema', label: 'Sistema' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#bpo', label: 'BPO' },
  { href: '#contato', label: 'Contato' },
] as const

type NavigationItem = (typeof navigation)[number]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState<NavigationItem['href'] | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

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
        visibility.forEach((ratio, target) => {
          if (ratio <= largestRatio) return
          largestRatio = ratio
          nextHref = targets.get(target) ?? null
        })
        setActiveHref(nextHref)
      },
      {
        rootMargin: '-38% 0px -48% 0px',
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

    function measureIndicator() {
      if (!activeHref || (window.innerWidth <= 700 && !isMenuOpen)) {
        indicator.dataset.visible = 'false'
        return
      }

      const link = Array.from(rail.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .find((candidate) => candidate.getAttribute('href') === activeHref)
      if (!link) {
        indicator.dataset.visible = 'false'
        return
      }

      const railRect = rail.getBoundingClientRect()
      const linkRect = link.getBoundingClientRect()
      indicator.style.width = `${linkRect.width}px`
      indicator.style.height = `${linkRect.height}px`
      indicator.style.transform = `translate3d(${linkRect.left - railRect.left}px, ${linkRect.top - railRect.top}px, 0)`
      indicator.dataset.visible = 'true'
    }

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measureIndicator)
    observer?.observe(rail)
    rail.querySelectorAll('a[href]').forEach((link) => observer?.observe(link))

    window.addEventListener('resize', measureIndicator)
    measureIndicator()
    void document.fonts?.ready.then(measureIndicator)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measureIndicator)
    }
  }, [activeHref, isMenuOpen])

  function closeAfterNavigation() {
    if (!isMenuOpen) return
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <header className={styles.header} data-scrolled={isScrolled}>
      <a className={styles.skipLink} href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <div className={styles.inner}>
        <a className={styles.brand} href="#inicio" aria-label="Kapitalis, início">
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandName}>{site.shortName}</span>
        </a>

        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>Menu</span>
        </button>

        <nav
          id="site-navigation"
          className={styles.navigation}
          aria-label="Navegação principal"
          data-open={isMenuOpen}
          ref={railRef}
        >
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
        </nav>

        <a
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
      </div>
    </header>
  )
}
