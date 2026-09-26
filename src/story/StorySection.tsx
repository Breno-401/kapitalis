import type { RefObject } from 'react'
import { StoryChapter } from './StoryChapter'
import styles from './StorySection.module.css'
import type {
  StoryChapter as StoryChapterData,
  StoryChapterId,
} from './types'

type StorySectionProps = {
  chapters: readonly StoryChapterData[]
  activeChapterId?: StoryChapterId | null
  rootRef?: RefObject<HTMLElement | null>
  trackRef?: RefObject<HTMLDivElement | null>
}

export function StorySection({
  chapters,
  activeChapterId = null,
  rootRef,
  trackRef,
}: StorySectionProps) {
  return (
    <section
      aria-label="Narrativa do Sistema Kapitalis"
      className={styles.storySection}
      ref={rootRef}
    >
      <div
        className={styles.trackLead}
        data-hero-track
        aria-hidden="true"
        ref={trackRef}
      />
      <div className={styles.chapters}>
        {chapters.map((chapter, index) => (
          <StoryChapter
            chapter={chapter}
            isActive={chapter.id === activeChapterId}
            key={chapter.id}
            targetId={index === 0 ? 'sistema' : chapter.id}
          />
        ))}
      </div>
    </section>
  )
}
