import { useRef } from 'react'
import { FinancialCore } from '../components/FinancialCore'
import { site } from '../data/site'
import kapitalisStoryData from '../data/kapitalisStory.json'
import { StorySection } from '../story/StorySection'
import type { StoryChapter } from '../story/types'
import { useActiveStoryChapter } from '../story/useActiveStoryChapter'
import styles from './HeroSection.module.css'
import { useHeroScrollProgress } from './useHeroScrollProgress'

const chapters = kapitalisStoryData as readonly StoryChapter[]

export function HeroSection() {
  const experienceRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const activeChapterId = useActiveStoryChapter(storyRef)
  const { introHidden, systemVisible, staticLayout } = useHeroScrollProgress(
    experienceRef,
    trackRef,
  )

  return (
    <section
      aria-labelledby="hero-title"
      className={styles.experience}
      data-static-layout={staticLayout}
      data-theme-surface="dark"
      id="inicio"
      ref={experienceRef}
    >
      <div className={styles.experienceGrid}>
        <div className={styles.visualRail}>
          <div className={styles.stage}>
            <div
              aria-hidden={introHidden}
              className={styles.heroCopy}
              data-intro-hidden={introHidden}
              inert={introHidden ? true : undefined}
            >
              <p className={styles.kicker} data-entry="eyebrow">
                Contabilidade &amp; BPO Financeiro · {site.locality}
              </p>
              <h1 className={styles.title} id="hero-title">
                <span className={styles.titleLine} data-entry="headline-one">
                  <span>Seus números sob controle.</span>
                </span>
                <span className={styles.titleLine} data-entry="headline-two">
                  Suas decisões com <em>mais clareza.</em>
                </span>
              </h1>
              <p className={styles.description} data-entry="subcopy">
                A Kapitalis organiza a rotina contábil e financeira para você
                acompanhar o negócio com mais clareza.
              </p>
              <div className={styles.actions} data-entry="cta">
                <a
                  className={styles.primaryAction}
                  href={site.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Conversar com a Kapitalis
                  <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                    <path d="M4.5 10h10m-4-4 4 4-4 4" />
                  </svg>
                </a>
                <a className={styles.secondaryAction} href="#sistema">
                  Conhecer o sistema Kapitalis
                </a>
              </div>
            </div>

            <figure
              className={styles.heroPortrait}
              data-hero-portrait
              data-portrait-crop="upper-torso"
              aria-label="Responsável pela Kapitalis"
            >
              <img
                alt="Responsável pela Kapitalis"
                decoding="async"
                fetchPriority="high"
                height="1417"
                src="/assets/kapitalis-responsavel-recortado.png"
                width="1110"
              />
            </figure>

            <div
              className={styles.systemLabel}
              data-system-visible={systemVisible}
            >
              <p>Sistema financeiro em perspectiva</p>
              <h2 id="system-title">Sistema Kapitalis</h2>
            </div>

            <div className={styles.corePosition}>
              <FinancialCore
                revealed={systemVisible}
                state={activeChapterId ?? 'entradas'}
              />
            </div>

            <a
              aria-hidden={introHidden}
              className={styles.scrollCue}
              data-entry="scroll-cue"
              href="#sistema"
              tabIndex={introHidden ? -1 : undefined}
            >
              <span>Rolar para o Sistema Kapitalis</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M10 2v14m-5-5 5 5 5-5" />
              </svg>
            </a>
          </div>
        </div>

        <StorySection
          activeChapterId={activeChapterId}
          chapters={chapters}
          rootRef={storyRef}
          trackRef={trackRef}
        />
      </div>
    </section>
  )
}
