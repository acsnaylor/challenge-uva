import { Link, NavLink, Outlet } from 'react-router-dom'
import { CakeSlice, ShoppingBag } from 'lucide-react'
import { useShop } from '../../app/ShopContext'
export function AppLayout() {
  const { cart, loading } = useShop()
  const count = cart?.completed ? 0 : cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  return <><div className="announcement">Um toque de doçura para os seus melhores momentos</div><header className="site-header"><Link className="brand" to="/"><CakeSlice size={30} /><span>doce ateliê<small>CUPCAKES GOURMET</small></span></Link><nav aria-label="Navegação principal"><NavLink to="/" end>Vitrine</NavLink><NavLink to="/orders">Meus pedidos</NavLink><NavLink to="/admin/products">Gerenciar produtos</NavLink></nav><Link className="bag" to="/cart" aria-label={`Carrinho com ${count} itens`}><ShoppingBag size={20} /><span>Carrinho</span><b>{count}</b></Link></header><main>{loading ? <p className="page" role="status">Recuperando sua sacola…</p> : <Outlet />}</main><footer><Link className="brand" to="/">doce ateliê</Link><p>Feito à mão. Pensado com carinho.</p><small>Projeto Integrador Transdisciplinar em Engenharia de Software II<br />Loja acadêmica · Pagamentos e entregas simulados</small></footer></>
}
