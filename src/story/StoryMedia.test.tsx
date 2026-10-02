import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StoryMedia } from './StoryMedia'

describe('replaceable story media', () => {
  it('image_media_renders_alt_text', () => {
    render(
      <StoryMedia
        media={{
          kind: 'image',
          src: '/editorial/financeiro.jpg',
          alt: 'Pessoa organizando documentos financeiros em uma mesa.',
          objectPosition: 'center 40%',
        }}
      />,
    )

    const image = screen.getByRole('img', {
      name: 'Pessoa organizando documentos financeiros em uma mesa.',
    })

    expect(image.getAttribute('src')).toBe('/editorial/financeiro.jpg')
    expect(image.getAttribute('alt')).toBe(
      'Pessoa organizando documentos financeiros em uma mesa.',
    )
  })

  it('wraps_story_photos_in_the_reusable_editorial_frame', () => {
    const { container } = render(
      <StoryMedia
        media={{
          kind: 'image',
          src: '/editorial/escritorio-entradas.png',
          alt: 'Sala de atendimento com mesa em L, cadeira de escritório, poltronas, notebook e planta.',
          objectPosition: 'center 54%',
        }}
      />,
    )

    expect(container.querySelector('[data-story-media]')).toBeTruthy()
  })

  it('diagram_scene_changes_with_chapter_data', () => {
    const { rerender } = render(
      <StoryMedia media={{ kind: 'diagram', scene: 'sources' }} />,
    )

    expect(
      screen.getByRole('img', { name: 'Fontes financeiras' }).getAttribute(
        'data-scene',
      ),
    ).toBe('sources')

    rerender(<StoryMedia media={{ kind: 'diagram', scene: 'decision' }} />)

    expect(
      screen.getByRole('img', { name: 'Decisão informada' }).getAttribute(
        'data-scene',
      ),
    ).toBe('decision')
  })
})
