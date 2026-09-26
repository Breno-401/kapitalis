import { describe, expect, it } from 'vitest'
import { selectNearestChapter } from './useActiveStoryChapter'

describe('direction-independent chapter activation', () => {
  it('story_activation_tracks_the_nearest_center_on_forward_and_back_scroll', () => {
    const chapters = [
      { id: 'entradas', center: 100 },
      { id: 'organizacao', center: 300 },
      { id: 'visibilidade', center: 500 },
    ]

    const viewportCenters = [50, 240, 410, 240, 50]

    expect(
      viewportCenters.map((center) =>
        selectNearestChapter(chapters, center)?.id,
      ),
    ).toEqual([
      'entradas',
      'organizacao',
      'visibilidade',
      'organizacao',
      'entradas',
    ])
  })
})
