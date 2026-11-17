import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/toast'
import { RequiredMark } from '../../components/ui/RequiredMark'
import { useShop } from '../../app/ShopContext'
import { shop, money, errorMessage, type Product, type ProductInput } from '../../services/shop'

export function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<number>()
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { show } = useToast()
  const { setError } = useShop()
  const { register, handleSubmit, reset } = useForm<ProductInput>()
  const load = async () => { setProducts(await shop.products()); setLoaded(true) }
  useEffect(() => { load().catch(e => setError(errorMessage(e))) }, [setError])
  const submit = handleSubmit(async data => {
    setBusy(true)
    try { await shop.saveProduct(data, editing); reset({ name: '', description: '', price: 0, imageUrl: '' }); setEditing(undefined); await load(); show('Produto salvo com sucesso.', { variant: 'success' }) }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }, () => setError('Preencha nome, descrição com pelo menos 10 caracteres, preço válido e URL da imagem.'))
  async function remove(product: Product) {
    if (!window.confirm(`Remover ${product.name} da vitrine?`)) return
    setBusy(true)
    try { await shop.deleteProduct(product.id); await load(); if (editing === product.id) { reset(); setEditing(undefined) } show('Produto removido da vitrine. Pedidos anteriores foram preservados.', { variant: 'success' }) }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <section className="page"><span className="eyebrow">ATELIÊ EM ORDEM</span><h1>Gerenciar produtos</h1><p className="muted">Área acadêmica de demonstração, sem autenticação administrativa.</p><p className="muted">Os campos com asterisco (*) são obrigatórios.</p><div className="admin-layout"><form className="panel" onSubmit={submit}><h2>{editing ? 'Editar cupcake' : 'Novo cupcake'}</h2><label>Nome<RequiredMark /><Input {...register('name', { required: 'Informe o nome.', minLength: 2, maxLength: 100 })} maxLength={100} required /></label><label>Descrição<RequiredMark /><textarea {...register('description', { required: true, minLength: 10, maxLength: 1000 })} minLength={10} maxLength={1000} required /></label><label>Preço (R$)<RequiredMark /><Input type="number" step="0.01" min="0.01" max="9999.99" {...register('price', { required: true, valueAsNumber: true, min: 0.01, max: 9999.99 })} required /></label><label>URL da imagem<RequiredMark /><Input {...register('imageUrl', { required: true, validate: value => /^(https?:\/\/|\/images\/)/.test(value) || 'Use uma URL HTTP/HTTPS ou um caminho /images/.' })} placeholder="https://… ou /images/morango.svg" required /></label><Button disabled={busy} type="submit">{busy ? 'Salvando…' : 'Salvar produto'}</Button>{editing && <Button variant="outline" type="button" onClick={() => { setEditing(undefined); reset({ name: '', description: '', price: 0, imageUrl: '' }) }}>Cancelar edição</Button>}</form><div className="panel"><h2>Produtos na vitrine</h2>{!loaded && <p>Carregando…</p>}{loaded && !products.length && <p>Nenhum produto cadastrado.</p>}{products.map(p => <article className="admin-row" key={p.id}><img src={p.imageUrl} alt="" /><div className="grow"><h3>{p.name}</h3><p>{money(p.price)}</p></div><Button variant="outline" disabled={busy} onClick={() => { setEditing(p.id); reset(p) }} aria-label={`Editar ${p.name}`}>Editar</Button><Button variant="ghost" disabled={busy} onClick={() => remove(p)} aria-label={`Remover ${p.name}`}>Remover</Button></article>)}</div></div></section>
}
