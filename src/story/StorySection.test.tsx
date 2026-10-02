import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import kapitalisStoryData from '../data/kapitalisStory.json'
import type { StoryChapter } from './types'
import { StorySection } from './StorySection'

const chapters: readonly StoryChapter[] = [
  {
    id: 'entradas',
    eyebrow: '01 · ENTRADAS',
    title: 'Entradas',
    body: 'As diferentes fontes da rotina financeira.',
    items: ['Vendas', 'Bancos', 'Notas', 'Folha', 'Despesas'],
  },
  {
    id: 'organizacao',
    eyebrow: '02 · ORGANIZAÇÃO',
    title: 'Organização',
    body: 'As rotinas financeiras em uma mesma leitura.',
    items: ['Pagamentos', 'Recebimentos', 'Conciliação', 'Tributos', 'Fechamento'],
  },
  {
    id: 'visibilidade',
    eyebrow: '03 · VISIBILIDADE',
    title: 'Visibilidade',
    body: 'Leituras para acompanhar o período.',
    items: ['Fluxo de caixa', 'Compromissos', 'Previsibilidade'],
  },
  {
    id: 'decisao',
    eyebrow: '04 · DECISÃO',
    title: 'Decisão',
    body: 'Contexto para organizar uma próxima conversa.',
    items: ['Contexto', 'Prioridade', 'Próximo passo'],
  },
]
const currentStory = kapitalisStoryData as readonly StoryChapter[]

describe('Kapitalis system story', () => {
  it('kapitalis_chapters_have_the_approved_concepts_in_order', () => {
    expect(
      currentStory.map(({ eyebrow, title, items }) => [eyebrow, title, items]),
    ).toEqual(chapters.map(({ eyebrow, title, items }) => [eyebrow, title, items]))
    expect(currentStory[2]?.body.toLocaleLowerCase()).not.toContain('indicadores')
  })

  it('story_chapters_render_in_order_with_one_active_step', () => {
    render(<StorySection chapters={chapters} activeChapterId="organizacao" />)

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.map((heading) => heading.textContent?.trim())).toEqual(
      chapters.map(({ title }) => title),
    )
    expect(document.querySelector('[aria-current="step"]')?.id).toBe(
      'organizacao',
    )
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      chapters.flatMap(({ items }) => items),
    )
  })

  it('story_chapters_remain_readable_without_intersection_observer', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<StorySection chapters={chapters} />)

    expect(document.querySelectorAll('[data-story-chapter]')).toHaveLength(4)
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual(chapters.map(({ title }) => title))
  })

  it('story_assigns_the_supplied_media_assets_to_their_chapters', () => {
    const { container } = render(
      <StorySection chapters={currentStory} activeChapterId="entradas" />,
    )

    const media = Array.from(container.querySelectorAll('[data-story-media]'))
    expect(media).toHaveLength(4)
    expect(
      media.map((frame) => frame.querySelector('img')?.getAttribute('src')),
    ).toEqual([
      '/editorial/escritorio-entradas.png',
      '/editorial/arte-organizacao-servicos.png',
      '/editorial/visibilidade-encontro-cutout.png',
      '/editorial/atendimento-decisao.png',
    ])
    const portrait = container.querySelector(
      '[data-story-id="visibilidade"] [data-story-media]',
    )
    expect(portrait?.getAttribute('data-fit')).toBe('contain')
    expect(portrait?.querySelector('figcaption')).toBeNull()
    expect(container.querySelector('[data-story-id="entradas"] [data-story-media]')
      ?.getAttribute('data-revealed')).toBe('true')
    expect(screen.getByText('Estrutura para acompanhar a rotina de perto.'))
      .toBeTruthy()
    expect(screen.getByRole('img', {
      name: /mesa em L, cadeira de escritório, poltronas, notebook e planta/i,
    })).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /uma pessoa está atrás da mesa e duas pessoas estão sentadas de frente/i,
    })).toBeTruthy()
  })
})
