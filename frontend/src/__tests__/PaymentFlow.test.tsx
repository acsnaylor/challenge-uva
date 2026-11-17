import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ShopProvider, useShop } from '../app/ShopContext'
import { ToastProvider } from '../components/ui/toast'
import { CheckoutPage } from '../pages/Store/CheckoutPage'
import { PaymentFailedPage } from '../pages/Store/PaymentFailedPage'
import { CartPage } from '../pages/Store/CartPage'
import { shop } from '../services/shop'

jest.mock('../services/shop', () => ({
  shop: { cart: jest.fn(), customer: jest.fn(), checkout: jest.fn() },
  money: (value: number) => `R$ ${value.toFixed(2)}`,
  errorMessage: () => 'Falha de conexão.',
}))
const mocked = jest.mocked(shop)
const cart = {
  id: 'cart-payment', customer: { id: 1, name: 'Ana Silva', email: 'ana@example.com', phone: '11999999999' },
  completed: false, total: 33.80, items: [{ productId: 1, name: 'Chocolate Belga', unitPrice: 16.90,
    imageUrl: '/images/chocolate.svg', quantity: 2, available: true }],
}
function LoadedCheckout() { return useShop().loading ? <p>Carregando…</p> : <CheckoutPage /> }
function setup() {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ToastProvider><ShopProvider><Routes>
      <Route path="/" element={<LoadedCheckout />} />
      <Route path="/payment-failed" element={<PaymentFailedPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders/:id" element={<h1>Pedido aprovado</h1>} />
    </Routes></ShopProvider></ToastProvider>
  </MemoryRouter>)
}
async function fillDelivery() {
  await screen.findByLabelText(/^CEP/)
  await userEvent.type(screen.getByLabelText(/^CEP/), '01310100')
  await userEvent.selectOptions(screen.getByLabelText(/^Estado/), 'SP')
  await userEvent.type(screen.getByLabelText(/^Rua/), 'Avenida Paulista')
  await userEvent.type(screen.getByLabelText(/^Número/), '100')
  await userEvent.type(screen.getByLabelText(/^Bairro/), 'Bela Vista')
  await userEvent.type(screen.getByLabelText(/^Cidade/), 'São Paulo')
}
beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear()
  localStorage.setItem('doce-atelie-cart', cart.id)
  mocked.cart.mockResolvedValue(cart); mocked.customer.mockResolvedValue(cart)
})

it('direciona recusa à página específica e retorna ao carrinho preservado', async () => {
  mocked.checkout.mockRejectedValue({ response: { status: 422 } })
  setup(); await fillDelivery()
  await userEvent.selectOptions(screen.getByLabelText(/^Resultado/), 'declined')
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' }))
  const heading = await screen.findByRole('heading', { name: 'Pagamento não aprovado' })
  expect(heading).toHaveFocus()
  expect(screen.getByText(/A compra não foi concluída/)).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(localStorage.getItem('doce-atelie-orders')).toBeNull()
  expect(localStorage.getItem('doce-atelie-cart')).toBe(cart.id)
  await userEvent.click(screen.getByRole('link', { name: 'Voltar ao carrinho' }))
  expect(await screen.findByLabelText('Quantidade de Chocolate Belga')).toHaveTextContent('2')
  expect(mocked.checkout).toHaveBeenCalledWith(cart.id, expect.objectContaining({ paymentSimulation: 'declined' }))
})

it('mantém aprovação no fluxo de confirmação e histórico', async () => {
  mocked.checkout.mockResolvedValue({ id: 1 } as Awaited<ReturnType<typeof shop.checkout>>)
  setup(); await fillDelivery()
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' }))
  expect(await screen.findByRole('heading', { name: 'Pedido aprovado' })).toBeInTheDocument()
  expect(localStorage.getItem('doce-atelie-cart')).toBeNull()
  expect(localStorage.getItem('doce-atelie-orders')).toBe('["cart-payment"]')
})

it('não confunde falha de conexão com pagamento recusado e preserva o formulário', async () => {
  mocked.checkout.mockRejectedValue(new Error('Network error'))
  setup(); await fillDelivery()
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha de conexão.')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' })).toBeEnabled())
  expect(screen.getByLabelText(/^Rua/)).toHaveValue('Avenida Paulista')
  expect(screen.queryByRole('heading', { name: 'Pagamento não aprovado' })).not.toBeInTheDocument()
  expect(localStorage.getItem('doce-atelie-cart')).toBe(cart.id)
})
