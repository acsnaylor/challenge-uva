import { Star } from 'lucide-react'

const examples = [
  { name: 'Marina S.', rating: 5, comment: 'O cupcake de chocolate é o meu favorito. Uma combinação de massa macia e cobertura cremosa para uma pausa especial.' },
  { name: 'Rafael M.', rating: 4, comment: 'Gostei de encontrar os sabores e conferir os preços com facilidade. A escolha dos cupcakes foi muito prática.' },
  { name: 'Clara L.', rating: 5, comment: 'O red velvet tem uma apresentação delicada. Uma ideia de carinho para compartilhar em uma comemoração.' },
]

export function CustomerReviews() {
  return <section className="reviews" aria-labelledby="reviews-title" aria-describedby="reviews-disclaimer">
    <span className="eyebrow">MOMENTOS DOCES PARA IMAGINAR</span>
    <h2 id="reviews-title">Avaliações de clientes</h2>
    <p id="reviews-disclaimer" className="muted">Exemplos demonstrativos: os nomes, as notas e os comentários abaixo são fictícios e não representam compras reais.</p>
    <div className="reviews-grid">
      {examples.map(review => <figure className="review-card" key={review.name}>
        <div className="review-stars" role="img" aria-label={`${review.rating} de 5 estrelas`}>
          {Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} aria-hidden="true"
            fill={index < review.rating ? 'currentColor' : 'none'} />)}
        </div>
        <blockquote><p>“{review.comment}”</p></blockquote>
        <figcaption>
          <span className="review-avatar" aria-hidden="true">{review.name[0]}</span>
          <div><strong>{review.name}</strong><small>Cliente fictício · Exemplo</small></div>
        </figcaption>
      </figure>)}
    </div>
  </section>
}
