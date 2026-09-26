import { useRef } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { StoryChapter } from './StoryChapter'
import { StoryMedia } from './StoryMedia'
import styles from './StorySection.module.css'
import type { StoryChapter as StoryChapterData } from './types'
import { useActiveStoryChapter } from './useActiveStoryChapter'

type StorySectionProps = {
  chapters: readonly StoryChapterData[]
}

export function StorySection({ chapters }: StorySectionProps) {
  const chaptersRef = useRef<HTMLDivElement>(null)
  const activeChapterId = useActiveStoryChapter(chaptersRef)
  const observerAvailable = typeof IntersectionObserver !== 'undefined'
  const activeChapter =
    chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0]
  const activeIndex = activeChapter
    ? chapters.findIndex((chapter) => chapter.id === activeChapter.id)
    : -1

  return (
    <section
      className={styles.storySection}
      id="sistema"
      aria-labelledby="story-title"
      data-observer={observerAvailable ? 'ready' : 'missing'}
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.storyEyebrow}>Sistema Kapitalis</p>
        <SectionHeading
          className={styles.storyHeading}
          id="story-title"
          title="Da origem dos dados à clareza para decidir."
          description="Uma representação visual de como diferentes fontes podem se transformar em informação útil para acompanhar a rotina."
        />

        <div className={styles.storyGrid}>
          {activeChapter && observerAvailable ? (
            <div className={styles.visualColumn}>
              <div className={styles.visualSticky}>
                <div className={styles.visualMeta}>
                  <span>Fluxo demonstrativo</span>
                  <span>
                    {String(activeIndex + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
                  </span>
                </div>
                <div className={styles.visualFrame} key={activeChapter.id}>
                  <StoryMedia media={activeChapter.media} />
                </div>
                <p className={styles.visualTitle}>{activeChapter.title}</p>
              </div>
            </div>
          ) : null}

          <div className={styles.chapters} ref={chaptersRef}>
            {chapters.map((chapter) => (
              <StoryChapter
                chapter={chapter}
                isActive={chapter.id === activeChapterId}
                key={chapter.id}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
