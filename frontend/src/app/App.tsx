import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ShopProvider } from './ShopContext'
import { Storefront } from '../pages/Store/Storefront'
import { CartPage } from '../pages/Store/CartPage'
import { AdminPage } from '../pages/Store/AdminPage'
import { CheckoutPage } from '../pages/Store/CheckoutPage'
import { OrdersPage } from '../pages/Store/OrdersPage'
import '../styles/globals.css'

export function App() {
  return <BrowserRouter><ShopProvider><Routes><Route path="/" element={<AppLayout />}>
    <Route index element={<Storefront />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="admin/products" element={<AdminPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="orders/:cartId" element={<OrdersPage />} />
    <Route path="*" element={<section className="empty"><h1>Página não encontrada</h1><a href="/">Voltar à vitrine</a></section>} />
  </Route></Routes></ShopProvider></BrowserRouter>
}
export default App
