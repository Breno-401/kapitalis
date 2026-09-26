import { StoryMedia } from './StoryMedia'
import styles from './StorySection.module.css'
import type { StoryChapter as StoryChapterData } from './types'

type StoryChapterProps = {
  chapter: StoryChapterData
  isActive: boolean
}

export function StoryChapter({ chapter, isActive }: StoryChapterProps) {
  return (
    <article
      className={styles.chapter}
      id={chapter.id}
      data-story-chapter
      data-active={isActive}
      aria-current={isActive ? 'step' : undefined}
    >
      <div className={styles.chapterText}>
        <p className={styles.chapterEyebrow}>{chapter.eyebrow}</p>
        <h3>{chapter.title}</h3>
        <p className={styles.chapterBody}>{chapter.body}</p>
      </div>
      <div className={styles.mobileMedia}>
        <StoryMedia media={chapter.media} />
      </div>
    </article>
  )
}
