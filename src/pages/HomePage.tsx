import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { BpoSection } from '../sections/BpoSection'
import { HeroSection } from '../sections/HeroSection'
import { ProblemSection } from '../sections/ProblemSection'
import { ServicesSection } from '../sections/ServicesSection'
import { StorySection } from '../story/StorySection'
import { TrustStrip } from '../sections/TrustStrip'
import type { StoryChapter } from '../story/types'
import kapitalisStoryData from '../data/kapitalisStory.json'

const kapitalisStory = kapitalisStoryData as readonly StoryChapter[]

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <StorySection chapters={kapitalisStory} />
        <ServicesSection />
        <BpoSection />
      </main>
      <SiteFooter />
    </>
  )
}
