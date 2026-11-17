import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useShop } from '../../app/ShopContext'
import { shop, money, errorMessage, type Delivery } from '../../services/shop'

interface CheckoutForm extends Delivery { name: string; email: string; phone: string; paymentSimulation: string }
export function CheckoutPage() {
  const { cart, loading, updateCart, finish, setError } = useShop()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({ defaultValues: {
    name: cart?.customer?.name || '', email: cart?.customer?.email || '', phone: cart?.customer?.phone || '',
    postalCode: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '', paymentSimulation: 'approved',
  } })
  const submit = handleSubmit(async data => {
    if (!cart || busy) return
    setBusy(true); setError('')
    try {
      const current = await shop.customer(cart.id, { name: data.name, email: data.email, phone: data.phone })
      updateCart(current)
      await shop.checkout(cart.id, { ...data, expectedTotal: cart.total })
      finish(cart.id); navigate(`/orders/${cart.id}`)
    } catch (e) {
      setError(errorMessage(e))
      // Refresh prices after a conflict while preserving the entered form fields.
      try { updateCart(await shop.cart(cart.id)) } catch { /* original error remains visible */ }
    } finally { setBusy(false) }
  })
  if (loading) return <p role="status">Carregando…</p>
  if (!cart || cart.completed || !cart.items.length) return <section className="empty"><h1>Escolha seus cupcakes primeiro</h1><Link to="/">Voltar à vitrine</Link></section>
  return <section className="page"><span className="eyebrow">FALTA POUCO</span><h1>Finalize seu pedido</h1><form className="checkout-layout" onSubmit={submit}><div className="panel"><h2>1. Cadastro do cliente</h2><label>Nome completo<Input {...register('name', { required: true, minLength: 2 })} autoComplete="name" required minLength={2} maxLength={100} /></label><div className="form-grid"><label>E-mail<Input type="email" {...register('email', { required: true })} autoComplete="email" required maxLength={254} /></label><label>Telefone com DDD<Input type="tel" {...register('phone', { required: true, pattern: /^\d{10,11}$/ })} pattern="[0-9]{10,11}" placeholder="11999999999" autoComplete="tel" required /></label></div><h2>2. Informações de entrega</h2><div className="form-grid"><label>CEP<Input {...register('postalCode', { required: true, pattern: /^\d{5}-?\d{3}$/ })} pattern="[0-9]{5}-?[0-9]{3}" autoComplete="postal-code" placeholder="00000-000" required /></label><label>Estado (UF)<select {...register('state', { required: true })} required><option value="">Selecione</option>{'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map(uf => <option key={uf}>{uf}</option>)}</select></label></div><label>Rua / avenida<Input {...register('street', { required: true })} autoComplete="address-line1" required maxLength={150} /></label><div className="form-grid"><label>Número<Input {...register('number', { required: true })} required maxLength={20} /></label><label>Bairro<Input {...register('neighborhood', { required: true })} required maxLength={100} /></label></div><label>Cidade<Input {...register('city', { required: true })} required maxLength={100} /></label><label>Complemento (opcional)<Input {...register('complement')} autoComplete="address-line2" maxLength={150} /></label><h2>3. Pagamento simulado</h2><p>Nenhuma cobrança será realizada. Não informe dados de cartão.</p><label>Resultado da simulação<select {...register('paymentSimulation')}><option value="approved">Aprovar pagamento</option><option value="declined">Recusar pagamento (teste)</option></select></label>{Object.keys(errors).length > 0 && <p className="error" role="alert">Confira os campos obrigatórios, telefone e CEP.</p>}</div><aside className="summary"><h2>Seu pedido</h2>{cart.items.map(i => <p key={i.productId}>{i.quantity}× {i.name}<span>{money(i.quantity * i.unitPrice)}</span></p>)}<p>Entrega <span>Grátis</span></p><hr /><p className="total">Total <strong>{money(cart.total)}</strong></p><Button disabled={busy || cart.items.some(i => !i.available)} type="submit">{busy ? 'Finalizando…' : 'Confirmar pedido e simular pagamento'}</Button><Link to="/cart">← Revisar carrinho</Link></aside></form></section>
}

