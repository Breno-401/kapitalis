import styles from './StorySection.module.css'
import { StoryMedia } from './StoryMedia'
import type { StoryChapter as StoryChapterData } from './types'

type StoryChapterProps = {
  chapter: StoryChapterData
  isActive: boolean
  targetId?: string
}

export function StoryChapter({
  chapter,
  isActive,
  targetId,
}: StoryChapterProps) {
  return (
    <article
      className={styles.chapter}
      id={targetId}
      data-story-chapter
      data-story-id={chapter.id}
      data-active={isActive}
      aria-current={isActive ? 'step' : undefined}
    >
      <div className={styles.chapterText} data-reveal-group>
        <p className={styles.chapterEyebrow} data-reveal="text">{chapter.eyebrow}</p>
        <h3 data-reveal="text" data-reveal-step="1">{chapter.title}</h3>
        <p className={styles.chapterBody} data-reveal="text" data-reveal-step="2">{chapter.body}</p>
        <ul className={styles.chapterItems} aria-label={`${chapter.title}: tópicos`} data-reveal="text" data-reveal-step="3">
          {chapter.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      {chapter.media ? (
        <StoryMedia media={chapter.media} revealed={isActive} />
      ) : null}
    </article>
  )
}
