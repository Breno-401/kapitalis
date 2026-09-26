import { useEffect, useState, type RefObject } from 'react'

type ChaptersRef = RefObject<HTMLElement | null>

export function useActiveStoryChapter(
  chaptersRef: ChaptersRef,
): string | null {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const root = chaptersRef.current
    if (!root) return

    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>('[data-story-chapter]'),
    )
    if (chapters.length === 0) return

    const visibility = new Map<
      Element,
      { isIntersecting: boolean; ratio: number }
    >()
    chapters.forEach((chapter) =>
      visibility.set(chapter, { isIntersecting: false, ratio: 0 }),
    )
    const verticalInset = Math.min(Math.round(window.innerHeight * 0.28), 180)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target, {
            isIntersecting: entry.isIntersecting,
            ratio: entry.intersectionRatio,
          })
        })

        const current = chapters
          .map((chapter) => {
            const state = visibility.get(chapter)
            return {
              chapter,
              isIntersecting: state?.isIntersecting ?? false,
              ratio: state?.ratio ?? 0,
            }
          })
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.ratio - first.ratio)[0]

        if (current?.chapter.id) setActiveChapterId(current.chapter.id)
      },
      {
        rootMargin: `-${verticalInset}px 0px -${verticalInset}px 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    )

    chapters.forEach((chapter) => observer.observe(chapter))
    return () => observer.disconnect()
  }, [chaptersRef])

  return activeChapterId
}
