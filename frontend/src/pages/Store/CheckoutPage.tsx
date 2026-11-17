import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { MaskedInput, digitsOnly } from '../../components/ui/MaskedInput'
import { RequiredMark } from '../../components/ui/RequiredMark'
import { useShop } from '../../app/ShopContext'
import { shop, money, errorMessage, type Delivery } from '../../services/shop'

interface CheckoutForm extends Delivery {
  name: string
  email: string
  phone: string
  paymentSimulation: string
}

export function CheckoutPage() {
  const { cart, loading, updateCart, finish, setError } = useShop()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { register, control, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      name: cart?.customer?.name || '', email: cart?.customer?.email || '',
      phone: digitsOnly(cart?.customer?.phone || ''), postalCode: '', street: '',
      number: '', neighborhood: '', city: '', state: '', complement: '', paymentSimulation: 'approved',
    },
  })
  const submit = handleSubmit(async data => {
    if (!cart || busy) return
    setBusy(true); setError('')
    try {
      const current = await shop.customer(cart.id, {
        name: data.name, email: data.email, phone: digitsOnly(data.phone),
      })
      updateCart(current)
      await shop.checkout(cart.id, { ...data, postalCode: digitsOnly(data.postalCode), expectedTotal: cart.total })
      finish(cart.id); navigate(`/orders/${cart.id}`)
    } catch (e) {
      setError(errorMessage(e))
      try { updateCart(await shop.cart(cart.id)) } catch { /* Keep the original error visible. */ }
    } finally { setBusy(false) }
  })

  if (loading) return <p role="status">Carregando…</p>
  if (!cart || cart.completed || !cart.items.length) return <section className="empty">
    <h1>Escolha seus cupcakes primeiro</h1><Link to="/">Voltar à vitrine</Link>
  </section>

  return <section className="page">
    <span className="eyebrow">FALTA POUCO</span>
    <h1>Finalize seu pedido</h1>
    <p className="muted">Os campos com asterisco (*) são obrigatórios.</p>
    <form className="checkout-layout" onSubmit={submit}>
      <div className="panel">
        <h2>1. Cadastro do cliente</h2>
        <label>Nome completo<RequiredMark />
          <Input {...register('name', { required: true, minLength: 2 })} autoComplete="name" required minLength={2} maxLength={100} />
        </label>
        <div className="form-grid">
          <label>E-mail<RequiredMark />
            <Input type="email" {...register('email', { required: true })} autoComplete="email" required maxLength={254} />
          </label>
          <label>Telefone com DDD<RequiredMark />
            <Controller name="phone" control={control} rules={{ required: true, pattern: /^\d{10,11}$/ }}
              render={({ field: { ref, ...field } }) => <MaskedInput {...field} inputRef={ref} mask="phone"
                type="tel" placeholder="(11) 99999-9999" autoComplete="tel" required aria-invalid={!!errors.phone}
                aria-describedby="phone-help" pattern="\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}" />} />
          </label>
        </div>
        <p id="phone-help" className="muted">Informe DDD e telefone com 10 ou 11 dígitos.</p>
        <h2>2. Informações de entrega</h2>
        <div className="form-grid">
          <label>CEP<RequiredMark />
            <Controller name="postalCode" control={control} rules={{ required: true, pattern: /^\d{8}$/ }}
              render={({ field: { ref, ...field } }) => <MaskedInput {...field} inputRef={ref} mask="postalCode"
                autoComplete="postal-code" placeholder="00000-000" required aria-invalid={!!errors.postalCode}
                pattern="[0-9]{5}-[0-9]{3}" />} />
          </label>
          <label>Estado (UF)<RequiredMark />
            <select {...register('state', { required: true })} required>
              <option value="">Selecione</option>
              {'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map(uf => <option key={uf}>{uf}</option>)}
            </select>
          </label>
        </div>
        <label>Rua / avenida<RequiredMark /><Input {...register('street', { required: true })} autoComplete="address-line1" required maxLength={150} /></label>
        <div className="form-grid">
          <label>Número<RequiredMark /><Input {...register('number', { required: true })} required maxLength={20} /></label>
          <label>Bairro<RequiredMark /><Input {...register('neighborhood', { required: true })} required maxLength={100} /></label>
        </div>
        <label>Cidade<RequiredMark /><Input {...register('city', { required: true })} required maxLength={100} /></label>
        <label>Complemento (opcional)<Input {...register('complement')} autoComplete="address-line2" maxLength={150} /></label>
        <h2>3. Pagamento simulado</h2>
        <p>Nenhuma cobrança será realizada. Não informe dados de cartão.</p>
        <label>Resultado da simulação<RequiredMark />
          <select {...register('paymentSimulation', { required: true })} required>
            <option value="approved">Aprovar pagamento</option>
            <option value="declined">Recusar pagamento (teste)</option>
          </select>
        </label>
        {Object.keys(errors).length > 0 && <p className="error" role="alert">Confira os campos obrigatórios, telefone e CEP.</p>}
      </div>
      <aside className="summary">
        <h2>Seu pedido</h2>
        {cart.items.map(i => <p key={i.productId}>{i.quantity}× {i.name}<span>{money(i.quantity * i.unitPrice)}</span></p>)}
        <p>Entrega <span>Grátis</span></p><hr />
        <p className="total">Total <strong>{money(cart.total)}</strong></p>
        <Button disabled={busy || cart.items.some(i => !i.available)} type="submit">
          {busy ? 'Finalizando…' : 'Confirmar pedido e simular pagamento'}
        </Button>
        <Link to="/cart">← Revisar carrinho</Link>
      </aside>
    </form>
  </section>
}
