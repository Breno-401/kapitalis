import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main} id="conteudo-principal" tabIndex={-1}>
        <section
          className={`container ${styles.intro}`}
          id="inicio"
          aria-labelledby="home-title"
        >
          <div>
            <h1 className={styles.title} id="home-title">
              Kapitalis Contabilidade &amp; BPO Financeiro
            </h1>
            <p className={styles.description}>
              Vila Velha — ES
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
