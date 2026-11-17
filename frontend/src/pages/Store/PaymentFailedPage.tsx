import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useShop } from '../../app/ShopContext'

export function PaymentFailedPage() {
  const { cart } = useShop()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  return <section className="page payment-failure">
    <div className="panel">
      <CircleAlert size={42} aria-hidden="true" />
      <span className="eyebrow">VAMOS TENTAR NOVAMENTE?</span>
      <h1 ref={heading} tabIndex={-1}>Pagamento não aprovado</h1>
      <p>Seu pagamento simulado foi recusado. A compra não foi concluída e nenhum pedido foi aprovado.</p>
      {cart && !cart.completed && cart.items.length > 0
        ? <p>Seus cupcakes e suas quantidades continuam no carrinho. Volte para revisar a compra e tentar novamente.</p>
        : <p>Volte ao carrinho para conferir seus itens antes de tentar novamente.</p>}
      <Button asChild><Link to="/cart">Voltar ao carrinho</Link></Button>
      <p className="muted">Esta é uma simulação acadêmica. Nenhuma cobrança foi realizada.</p>
    </div>
  </section>
}
