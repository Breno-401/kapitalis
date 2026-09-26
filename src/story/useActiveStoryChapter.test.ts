import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useActiveStoryChapter } from './useActiveStoryChapter'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('active story chapter observer', () => {
  it('observer_selects_current_chapter', () => {
    let callback: IntersectionObserverCallback | undefined
    let rootMargin = ''
    const observed: Element[] = []

    class MockIntersectionObserver {
      constructor(
        nextCallback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        callback = nextCallback
        rootMargin = options?.rootMargin ?? ''
      }

      observe(target: Element) {
        observed.push(target)
      }

      disconnect() {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    const root = document.createElement('div')
    const chapters = ['information', 'decision'].map((id) => {
      const chapter = document.createElement('article')
      chapter.id = id
      chapter.dataset.storyChapter = ''
      root.append(chapter)
      return chapter
    })
    const chaptersRef = { current: root }
    const { result } = renderHook(() => useActiveStoryChapter(chaptersRef))

    expect(observed.length).toBe(2)
    const verticalInset = Math.min(Math.round(window.innerHeight * 0.28), 180)
    expect(rootMargin).toBe(`-${verticalInset}px 0px -${verticalInset}px 0px`)

    const intersectionEntry = (
      target: Element,
      intersectionRatio: number,
    ): IntersectionObserverEntry => {
      const bounds = target.getBoundingClientRect()
      return {
        target,
        isIntersecting: true,
        intersectionRatio,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: null,
        time: 0,
      }
    }

    act(() => {
      callback?.(
        [
          intersectionEntry(chapters[0], 0.42),
          intersectionEntry(chapters[1], 0.8),
        ],
        {} as IntersectionObserver,
      )
    })

    expect(result.current).toBe('decision')
  })

  it('missing_intersection_observer_leaves_state_static', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const root = document.createElement('div')
    const chaptersRef = { current: root }
    const { result } = renderHook(() => useActiveStoryChapter(chaptersRef))

    expect(result.current).toBeNull()
  })
})
