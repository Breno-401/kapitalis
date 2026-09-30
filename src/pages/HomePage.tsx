import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { PrivacyNotice } from '../components/PrivacyNotice'
import { SectionTransition } from '../components/SectionTransition'
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

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
        <SectionTransition />
        <ServicesSection />
        <SectionTransition />
        <BpoSection />
        <SectionTransition />
        <ToolsSection />
        <SectionTransition />
        <ProcessSection />
        <SectionTransition />
        <ReviewsSection data={googleReviewsSnapshot} />
        <SectionTransition />
        <FaqSection />
        <SectionTransition />
        <FinalCtaSection />
      </main>
      <SiteFooter />
      <PrivacyNotice />
      <WhatsAppFloating />
    </>
  )
}
