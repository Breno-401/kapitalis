import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import kapitalisStoryData from '../data/kapitalisStory.json'
import type { StoryChapter } from './types'
import { StorySection } from './StorySection'

const chapters: readonly StoryChapter[] = [
  {
    id: 'entradas',
    eyebrow: '01 · ACOMPANHAMENTO',
    title: 'Acompanhamento',
    body: 'Sua empresa não é apenas mais um CNPJ. Na Kapitalis, acompanhamos de perto a rotina da sua empresa, cuidando da contabilidade e das obrigações para que você tenha informações claras e segurança para tomar decisões.',
    items: ['Abertura e Fechamento de empresas', 'Regularização e Pendência Fiscal', 'Departamento Pessoal', 'Planejamento Tributário', 'BPO Financeiro'],
  },
  {
    id: 'organizacao',
    eyebrow: '02 · ORGANIZAÇÃO',
    title: 'Organização',
    body: 'Sua empresa merece mais do que uma contabilidade que apenas entrega obrigações. Merece acompanhamento, análise e orientação em cada etapa.',
    items: ['Pagamentos', 'Recebimentos', 'Conciliação', 'Tributos', 'Fechamento'],
  },
  {
    id: 'visibilidade',
    eyebrow: '03 · VISIBILIDADE',
    title: 'Visibilidade',
    body: 'Com uma contabilidade próxima, você nunca precisará tomar decisões sozinho.',
    items: ['Fluxo de caixa', 'Compromissos', 'Previsibilidade'],
  },
  {
    id: 'decisao',
    eyebrow: '04 · DECISÃO',
    title: 'Decisão',
    body: 'Decisões melhores começam com informações confiáveis.',
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
      '/editorial/alexandre-neto-organizacao.jpg',
      '/editorial/visibilidade-encontro-cutout.png',
      '/editorial/atendimento-decisao.png',
    ])
    const portrait = container.querySelector(
      '[data-story-id="visibilidade"] [data-story-media]',
    )
    expect(portrait?.getAttribute('data-fit')).toBe('contain')
    expect(container.querySelector('[data-story-id="organizacao"] img')?.getAttribute('width')).toBe('562')
    expect(container.querySelector('[data-story-id="organizacao"] img')?.getAttribute('height')).toBe('730')
    expect(portrait?.querySelector('figcaption')).toBeNull()
    expect(container.querySelector('[data-story-id="entradas"] [data-story-media]')
      ?.getAttribute('data-revealed')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Acompanhamento' })).toBeTruthy()
    expect(screen.getByText(chapters[0]!.body)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Organização' })).toBeTruthy()
    expect(screen.getByText(chapters[1]!.body)).toBeTruthy()
    expect(screen.getByText(chapters[2]!.body)).toBeTruthy()
    expect(screen.getByText(chapters[3]!.body)).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /responsável pela Kapitalis sentado à mesa do escritório, diante de uma estante e de um notebook/i,
    })).toBeTruthy()
    expect(screen.getByRole('img', {
      name: /uma pessoa está atrás da mesa e duas pessoas estão sentadas de frente/i,
    })).toBeTruthy()
  })
})
