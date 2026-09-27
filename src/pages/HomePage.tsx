import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { WhatsAppFloating } from '../components/WhatsAppFloating'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { BpoSection } from '../sections/BpoSection'
import { FinalCtaSection } from '../sections/FinalCtaSection'
import { HeroSection } from '../sections/HeroSection'
import { FaqSection } from '../sections/FaqSection'
import { ProcessSection } from '../sections/ProcessSection'
import { ReviewsSection } from '../sections/ReviewsSection'
import { ServicesSection } from '../sections/ServicesSection'
import { ToolsSection } from '../sections/ToolsSection'
import { TrustStrip } from '../sections/TrustStrip'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
        <ReviewsSection data={googleReviewsSnapshot} />
        <TrustStrip />
        <ServicesSection />
        <BpoSection />
        <ToolsSection />
        <ProcessSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
      <WhatsAppFloating />
    </>
  )
}
