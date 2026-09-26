import { BrandMark } from './BrandMark'
import { site } from '../data/site'
import styles from './SiteFooter.module.css'

const footerNavigation = [
  { href: '#inicio', label: 'Início' },
  { href: '#contexto', label: 'Contexto' },
  { href: '#sistema', label: 'Sistema Kapitalis' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#bpo', label: 'BPO Financeiro' },
  { href: '#processo', label: 'Processo' },
  { href: '#conteudo', label: 'Ferramentas e conteúdo' },
  { href: '#contato', label: 'Contato' },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer} id="contato">
      <div className={`container ${styles.content}`}>
        <div className={styles.brandBlock}>
          <a className={styles.brand} href="#inicio">
            <BrandMark className={styles.brandMark} />
            <span>{site.name}</span>
          </a>
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
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Avaliações no Google
              </a>
            </li>
            <li>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
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
