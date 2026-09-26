import { useEffect, useState, type RefObject } from 'react'
import type { StoryChapterId } from './types'

type StoryRootRef = RefObject<HTMLElement | null>

type CenteredChapter = {
  id: string
  center: number
}

export function selectNearestChapter<T extends CenteredChapter>(
  chapters: readonly T[],
  viewportCenter: number,
): T | undefined {
  return chapters.reduce<T | undefined>((nearest, chapter) => {
    if (!nearest) return chapter

    return Math.abs(chapter.center - viewportCenter) <
      Math.abs(nearest.center - viewportCenter)
      ? chapter
      : nearest
  }, undefined)
}

export function useActiveStoryChapter(
  chaptersRef: StoryRootRef,
): StoryChapterId | null {
  const [activeChapterId, setActiveChapterId] =
    useState<StoryChapterId | null>(null)

  useEffect(() => {
    const root = chaptersRef.current
    if (!root) return

    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>('[data-story-chapter]'),
    )
    if (chapters.length === 0) return

    let centers: CenteredChapter[] = []
    let frame = 0

    function measure() {
      centers = chapters.map((chapter) => {
        const rect = chapter.getBoundingClientRect()
        return {
          id: chapter.dataset.storyId ?? '',
          center: rect.top + window.scrollY + rect.height / 2,
        }
      })
      schedule()
    }

    function updateActiveChapter() {
      frame = 0
      const nearest = selectNearestChapter(
        centers,
        window.scrollY + window.innerHeight / 2,
      )
      if (nearest && nearest.id) {
        setActiveChapterId(nearest.id as StoryChapterId)
      }
    }

    function schedule() {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveChapter)
    }

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure)
    observer?.observe(root)
    chapters.forEach((chapter) => observer?.observe(chapter))

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    measure()

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [chaptersRef])

  return activeChapterId
}
