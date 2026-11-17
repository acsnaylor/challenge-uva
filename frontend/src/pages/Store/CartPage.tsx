import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { useShop } from '../../app/ShopContext'
import { errorMessage, money } from '../../services/shop'

export function CartPage() {
  const { cart, loading, busy, changeQuantity, setError } = useShop()
  const change = async (id: number, quantity: number) => { try { await changeQuantity(id, quantity) } catch (e) { setError(errorMessage(e)) } }
  if (loading) return <p role="status">Carregando carrinho…</p>
  if (!cart || cart.completed || !cart.items.length) return <section className="empty"><h1>Seu carrinho está vazio</h1><p>Escolha um cupcake para começar.</p><Link className="primary-link" to="/">Explorar sabores</Link></section>
  return <section className="page"><span className="eyebrow">SEU MOMENTO DOCE</span><h1>Carrinho de compras</h1><div className="cart-layout"><div>{cart.items.map(item => <article className="cart-row" key={item.productId}><img src={item.imageUrl} alt={item.name} /><div className="grow"><h3>{item.name}</h3><p>{money(item.unitPrice)} / unidade</p>{!item.available && <p className="error">Indisponível. Remova para continuar.</p>}<div className="quantity"><Button variant="outline" aria-label={`Diminuir ${item.name}`} disabled={busy} onClick={() => change(item.productId, item.quantity - 1)}>−</Button><span aria-label={`Quantidade de ${item.name}`}>{item.quantity}</span><Button variant="outline" aria-label={`Aumentar ${item.name}`} disabled={busy || item.quantity >= 99 || !item.available} onClick={() => change(item.productId, item.quantity + 1)}>+</Button><button className="text-button" disabled={busy} onClick={() => change(item.productId, 0)}>Remover</button></div></div><strong>{money(item.unitPrice * item.quantity)}</strong></article>)}</div><aside className="summary"><h2>Resumo do pedido</h2><p>Produtos <span>{money(cart.total)}</span></p><p>Entrega <span>Grátis</span></p><hr /><p className="total">Total <strong>{money(cart.total)}</strong></p><Button asChild disabled={busy}><Link to="/checkout">Continuar para entrega →</Link></Button><p className="muted">Pagamento apenas simulado.</p></aside></div></section>
}
