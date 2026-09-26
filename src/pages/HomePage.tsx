import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { BpoSection } from '../sections/BpoSection'
import { HeroSection } from '../sections/HeroSection'
import { ProblemSection } from '../sections/ProblemSection'
import { ServicesSection } from '../sections/ServicesSection'
import { TrustStrip } from '../sections/TrustStrip'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <ServicesSection />
        <BpoSection />
      </main>
      <SiteFooter />
    </>
  )
}
