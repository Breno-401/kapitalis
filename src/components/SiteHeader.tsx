import { useEffect, useRef, useState } from 'react'
import { BrandMark } from './BrandMark'
import { site } from '../data/site'
import styles from './SiteHeader.module.css'

const navigation = [
  { href: '#contexto', label: 'Contexto' },
  { href: '#sistema', label: 'Sistema' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#bpo', label: 'BPO Financeiro' },
  { href: '#contato', label: 'Contato' },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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

  function closeAfterNavigation() {
    if (!isMenuOpen) return
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="#inicio">
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{site.shortName}</span>
            <span className={styles.brandDescriptor}>
              Contabilidade &amp; BPO Financeiro
            </span>
          </span>
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
        >
          <ul className={styles.navigationList}>
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <a className={styles.navigationLink} href={href} onClick={closeAfterNavigation}>
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
          Fale conosco
        </a>
      </div>
    </header>
  )
}
