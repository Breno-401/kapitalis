import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { HeroSection } from '../sections/HeroSection'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
      </main>
      <SiteFooter />
    </>
  )
}
