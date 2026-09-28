import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionTransition } from './SectionTransition'

describe('transição entre seções', () => {
  it('é decorativa e usa o mesmo trilho compartilhado', () => {
    const { container } = render(<SectionTransition />)
    const transition = container.querySelector('[data-section-transition]')

    expect(transition?.getAttribute('aria-hidden')).toBe('true')
    expect(transition?.getAttribute('data-visible')).toBe('true')
  })
})
