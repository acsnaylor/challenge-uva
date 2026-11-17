import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ShopProvider } from './ShopContext'
import { Storefront } from '../pages/Store/Storefront'
import { CartPage } from '../pages/Store/CartPage'
import { AdminPage } from '../pages/Store/AdminPage'
import { CheckoutPage } from '../pages/Store/CheckoutPage'
import { OrdersPage } from '../pages/Store/OrdersPage'
import { PaymentFailedPage } from '../pages/Store/PaymentFailedPage'
import '../styles/globals.css'
import { ToastProvider } from '../components/ui/toast'

export function App() {
  return <BrowserRouter><ToastProvider><ShopProvider><Routes><Route path="/" element={<AppLayout />}>
    <Route index element={<Storefront />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="payment-failed" element={<PaymentFailedPage />} />
    <Route path="admin/products" element={<AdminPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="orders/:cartId" element={<OrdersPage />} />
    <Route path="*" element={<section className="empty"><h1>Página não encontrada</h1><a href="/">Voltar à vitrine</a></section>} />
  </Route></Routes></ShopProvider></ToastProvider></BrowserRouter>
}
export default App
