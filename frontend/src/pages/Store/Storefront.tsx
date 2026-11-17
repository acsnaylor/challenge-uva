import { useEffect, useState } from 'react'
import { useToast } from '../../components/ui/toast'
import { ArrowRight, Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'
import { useShop } from '../../app/ShopContext'
import { shop, money, errorMessage, type Product } from '../../services/shop'

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const { show } = useToast()
  const { cart, changeQuantity, busy, loading: cartLoading, setError } = useShop()
  useEffect(() => { shop.products().then(setProducts).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)) }, [setError])
  async function add(product: Product) {
    try {
      const quantity = cart?.completed ? 0 : cart?.items.find(i => i.productId === product.id)?.quantity || 0
      if (quantity >= 99) { setError('Limite de 99 unidades por produto.'); return }
      await changeQuantity(product.id, quantity + 1); show(`${product.name} adicionado ao carrinho.`, { variant: 'success' })
    } catch (e) { setError(errorMessage(e)) }
  }
  const filtered = products.filter(p => `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
  return <>
    <section className="hero">
      <div><span className="eyebrow">PEQUENOS DOCES, GRANDES MOMENTOS</span><h1>Um carinho em<br /><em>forma de cupcake.</em></h1><p>Ingredientes especiais, coberturas generosas e o cuidado artesanal em cada detalhe. Escolha o seu próximo momento doce.</p><a className="primary-link" href="#sabores">Conheça nossos sabores <ArrowRight size={18} /></a><div className="hero-note">Feitos artesanalmente · Entrega gratuita nesta demonstração</div></div>
      <div className="hero-art"><img src="/images/morango.svg" alt="Cupcake com cobertura de morango" /><span className="art-label">Feito com afeto ♡</span></div>
    </section>
    <section id="sabores" className="catalog"><div className="section-title"><div><span className="eyebrow">NOSSA VITRINE</span><h2>Qual vai adoçar seu dia?</h2></div><Input aria-label="Buscar cupcakes" placeholder="Buscar um sabor…" value={query} onChange={e => setQuery(e.target.value)} className="search" /></div>

      {loading ? <p role="status">Preparando a vitrine…</p> : filtered.length === 0 ? <p>Nenhum cupcake encontrado.</p> : <div className="product-grid">{filtered.map(p => <article className="product-card" key={p.id}><div className="product-image"><ImageWithFallback src={p.imageUrl} alt={p.name} loading="lazy" /></div><div className="product-info"><span className="eyebrow">CUPCAKE GOURMET</span><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><Button onClick={() => add(p)} disabled={busy || cartLoading} aria-label={`Adicionar ${p.name}`}><Plus size={16} /> Adicionar</Button></div></div></article>)}</div>}
    </section>
    <section className="story"><span className="eyebrow">DO NOSSO ATELIÊ PARA VOCÊ</span><h2>Cada detalhe tem um toque de carinho.</h2><p>Uma pausa no meio do dia, um presente especial ou uma celebração. Sempre existe uma boa ocasião para um doce feito à mão.</p></section>
  </>
}
