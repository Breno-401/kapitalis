import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { googleReviewsSnapshot } from '../data/googleReviews'
import { ReviewsSection } from './ReviewsSection'

describe('Google Reviews section', () => {
  it('renders the verified aggregate and nine sourced customer reviews', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    expect(screen.getByText('5,0')).toBeTruthy()
    expect(screen.getByText('52 avaliações no Google')).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(screen.getByText('Jimmy Campos')).toBeTruthy()
    expect(screen.getByText('Lorena Barros')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Ver avaliações no Google' }).getAttribute('href'),
    ).toBe(googleReviewsSnapshot.sourceUrl)
  })

  it('keeps the complete review available behind an accessible expansion', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    const review = screen.getByRole('article', { name: 'Avaliação de Rafael de Oliveira Matos' })
    expect(within(review).getByText(/Melhor coisa que fiz/).textContent).not.toContain(
      'hoje em dia pra achar profissional bom ta muito difícil.',
    )

    const expand = within(review).getByRole('button', {
      name: 'Ler avaliação completa de Rafael de Oliveira Matos',
    })
    fireEvent.click(expand)

    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(
      within(review).getByText(/hoje em dia pra achar profissional bom ta muito difícil\./),
    ).toBeTruthy()
  })

  it('labels each five-star rating and links each review to its Google source', () => {
    render(<ReviewsSection data={googleReviewsSnapshot} />)

    const reviews = screen.getAllByRole('article')
    expect(
      reviews.every((review) =>
        within(review).getByText('5 de 5 estrelas') &&
        within(review).getByRole('link', { name: /Ver avaliação de .+ no Google/ }),
      ),
    ).toBe(true)
    expect(document.querySelector('a[href="#"]')).toBeNull()
  })
})
