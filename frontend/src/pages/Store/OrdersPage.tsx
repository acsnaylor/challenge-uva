import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useToast } from '../../components/ui/toast'
import { shop, money, errorMessage, type Order } from '../../services/shop'

export function OrdersPage() {
  const { cartId } = useParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const { show } = useToast()
  useEffect(() => {
    setLoading(true); setFailed(false)
    const ids: string[] = cartId ? [cartId] : JSON.parse(localStorage.getItem('doce-atelie-orders') || '[]')
    Promise.all(ids.map(id => shop.order(id))).then(data => setOrders(data.reverse())).catch(e => { setFailed(true); show(errorMessage(e), { variant: 'error' }) }).finally(() => setLoading(false))
  }, [cartId, show])
  return <section className="page"><span className="eyebrow">FEITO PARA VOCÊ</span><h1>{cartId ? 'Pedido confirmado' : 'Meus pedidos'}</h1>{loading && <p role="status">Buscando pedidos…</p>}{!loading && !failed && !orders.length && <p>Você ainda não possui pedidos neste navegador. <Link to="/">Conheça a vitrine</Link></p>}{orders.map(o => <article className="panel order" key={o.id}><div className="section-title"><h2>Pedido #{String(o.id).padStart(4, '0')}</h2><span className="status">{o.paymentStatus}</span></div><p>{new Date(o.createdAt).toLocaleString('pt-BR')} · {o.customerName}</p><p>{o.customerEmail}</p>{o.items.map((item, index) => <p className="order-line" key={index}><span>{item.quantity}× {item.productName}</span><strong>{money(item.unitPrice * item.quantity)}</strong></p>)}<hr /><p className="order-line total"><span>Total com entrega grátis</span><strong>{money(o.total)}</strong></p><h3>Endereço de entrega</h3><p>{o.street}, {o.number}{o.complement ? ` · ${o.complement}` : ''}<br />{o.neighborhood} · {o.city}/{o.state} · CEP {o.postalCode}</p><p className="muted">Demonstração acadêmica: não haverá cobrança nem entrega real.</p></article>)}<Link className="primary-link" to="/">Continuar comprando →</Link></section>
}
