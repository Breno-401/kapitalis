import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import kapitalisStoryData from '../data/kapitalisStory.json'
import type { StoryChapter } from './types'
import { StorySection } from './StorySection'

const chapters: readonly StoryChapter[] = [
  {
    id: 'sources',
    eyebrow: '01 · FONTES',
    title: 'Fontes entram na rotina.',
    body: 'Bancos, vendas e obrigações formam a origem.',
    media: { kind: 'diagram', scene: 'sources' },
  },
  {
    id: 'organized',
    eyebrow: '02 · ROTINA',
    title: 'Rotinas ganham ordem.',
    body: 'Pagamentos e recebimentos são organizados.',
    media: { kind: 'diagram', scene: 'organized' },
  },
  {
    id: 'information',
    eyebrow: '03 · INFORMAÇÃO',
    title: 'O fluxo fica mais claro.',
    body: 'A informação acompanha o período.',
    media: { kind: 'diagram', scene: 'information' },
  },
  {
    id: 'decision',
    eyebrow: '04 · DECISÃO',
    title: 'Decisões ganham contexto.',
    body: 'A conversa olha para os próximos passos.',
    media: { kind: 'diagram', scene: 'decision' },
  },
]
const currentStory = kapitalisStoryData as readonly StoryChapter[]

describe('reusable story section', () => {
  it('kapitalis_chapters_have_nonempty_copy_and_media', () => {
    expect(currentStory.length).toBe(4)
    expect(
      currentStory.every(
        (chapter) =>
          chapter.id.trim() &&
          chapter.title.trim() &&
          chapter.body.trim() &&
          (chapter.media.kind === 'image'
            ? chapter.media.src.trim() && chapter.media.alt.trim()
            : chapter.media.scene.trim()),
      ),
    ).toBe(true)
  })

  it('story_chapters_render_in_order', () => {
    render(<StorySection chapters={chapters} />)

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual(chapters.map(({ title }) => title))
  })

  it('story_chapters_remain_in_order_without_intersection_observer', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<StorySection chapters={chapters} />)

    expect(
      document.querySelector('[data-observer="missing"]'),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual(chapters.map(({ title }) => title))
    expect(document.querySelectorAll('[data-scene]').length).toBe(4)
  })
})
