import { OPEN_PRIVACY_DETAILS_EVENT } from './PrivacyNotice'
import { BrandMark } from './BrandMark'
import { site } from '../data/site'
import styles from './SiteFooter.module.css'

const footerNavigation = [
  { href: '#inicio', label: 'Início' },
  { href: '#duvidas-frequentes', label: 'FAQ' },
  { href: '#sistema', label: 'Sistema Kapitalis' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#bpo', label: 'BPO Financeiro' },
  { href: '#processo', label: 'Processo' },
  { href: '#conteudo', label: 'Ferramentas' },
  { href: '#avaliacoes', label: 'Avaliações no Google' },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer} data-theme-surface="dark" id="contato">
      <div className={`container ${styles.content}`}>
        <div className={styles.brandBlock}>
          <a className={styles.brand} href="#inicio" aria-label="Kapitalis, início">
            <BrandMark
              className={styles.brandMark}
              height="64"
              width="64"
            />
            <span>{site.shortName}</span>
          </a>
          <p className={styles.tagline}>
            Contabilidade e BPO Financeiro para acompanhar a rotina da empresa.
          </p>
          <p className={styles.locality}>{site.locality}</p>
        </div>

        <nav className={styles.navigation} aria-label="Navegação complementar">
          <h2 className={styles.groupTitle}>Navegação</h2>
          <ul className={styles.linkList}>
            {footerNavigation.map(({ href, label }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
            <li>
              <a
                href="#privacidade"
                onClick={() => window.dispatchEvent(new Event(OPEN_PRIVACY_DETAILS_EVENT))}
              >
                Privacidade
              </a>
            </li>
          </ul>
        </nav>

        <address className={styles.contact}>
          <h2 className={styles.groupTitle}>Fale com a Kapitalis</h2>
          <ul className={styles.linkList}>
            <li>
              <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a
                aria-label="WhatsApp (abre em nova aba)"
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                aria-label="Avaliações no Google (abre em nova aba)"
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Avaliações no Google
              </a>
            </li>
            <li>
              <a
                aria-label="Instagram (abre em nova aba)"
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                aria-label="Facebook (abre em nova aba)"
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </li>
          </ul>
        </address>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© 2026 {site.name}</p>
      </div>
    </footer>
  )
}
