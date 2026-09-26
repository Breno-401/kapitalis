import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { BpoSection } from '../sections/BpoSection'
import { HeroSection } from '../sections/HeroSection'
import { ProblemSection } from '../sections/ProblemSection'
import { ReviewsSection } from '../sections/ReviewsSection'
import { ServicesSection } from '../sections/ServicesSection'
import { TrustStrip } from '../sections/TrustStrip'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
        <ReviewsSection data={googleReviewsSnapshot} />
        <TrustStrip />
        <ProblemSection />
        <ServicesSection />
        <BpoSection />
      </main>
      <SiteFooter />
    </>
  )
}
