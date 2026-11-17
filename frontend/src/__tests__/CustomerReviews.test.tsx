import { render, screen, within } from '@testing-library/react'
import { CustomerReviews } from '../components/CustomerReviews'

it('apresenta avaliações, nomes e comentários identificados como exemplos fictícios', () => {
  render(<CustomerReviews />)
  const section = screen.getByRole('region', { name: 'Avaliações de clientes' })
  expect(section).toHaveAccessibleDescription(/fictícios e não representam compras reais/)
  const cards = within(section).getAllByRole('figure')
  expect(cards).toHaveLength(3)
  for (const card of cards) {
    expect(within(card).getByText('Cliente fictício · Exemplo')).toBeInTheDocument()
    expect(within(card).getByRole('img', { name: /[1-5] de 5 estrelas/ })).toBeInTheDocument()
    expect(card.querySelector('figcaption strong')?.textContent).toBeTruthy()
    expect(card.querySelector('blockquote p')?.textContent).toBeTruthy()
  }
})
