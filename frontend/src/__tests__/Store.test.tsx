import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ShopProvider } from '../app/ShopContext'
import { Storefront } from '../pages/Store/Storefront'
import { CartPage } from '../pages/Store/CartPage'
import { AdminPage } from '../pages/Store/AdminPage'
import { CheckoutPage } from '../pages/Store/CheckoutPage'
import { OrdersPage } from '../pages/Store/OrdersPage'
import { ToastProvider } from '../components/ui/toast'
import { shop } from '../services/shop'

jest.mock('../services/shop', () => ({
  shop: { products: jest.fn(), createCart: jest.fn(), cart: jest.fn(), quantity: jest.fn(), saveProduct: jest.fn(), deleteProduct: jest.fn(), customer: jest.fn(), checkout: jest.fn(), order: jest.fn() },
  money: (value: number) => `R$ ${value.toFixed(2)}`,
  errorMessage: () => 'Falha na operação.',
}))
const mocked = jest.mocked(shop)
const product = { id: 1, name: 'Chocolate Belga', description: 'Cupcake de chocolate artesanal.', price: 16.90, imageUrl: '/images/chocolate.svg' }
const cart = { id: 'cart-1', customer: null, completed: false, total: 33.80, items: [{ productId: 1, name: product.name, unitPrice: 16.90, imageUrl: product.imageUrl, quantity: 2, available: true }] }
function mount(component: React.ReactNode) { return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ToastProvider><ShopProvider>{component}</ShopProvider></ToastProvider></MemoryRouter>) }
beforeEach(() => { jest.clearAllMocks(); localStorage.clear(); mocked.products.mockResolvedValue([product]); mocked.cart.mockResolvedValue(cart) })

it('exibe produtos da API e filtra sabores', async () => {
  mount(<Storefront />)
  expect(await screen.findByText('Chocolate Belga')).toBeInTheDocument()
  expect(screen.getByText('R$ 16.90')).toBeInTheDocument()
  await userEvent.type(screen.getByRole('textbox', { name: 'Buscar cupcakes' }), 'limão')
  expect(screen.getByText('Nenhum cupcake encontrado.')).toBeInTheDocument()
})

it('adiciona produto criando e persistindo carrinho na API', async () => {
  mocked.createCart.mockResolvedValue({ ...cart, total: 0, items: [] })
  mocked.quantity.mockResolvedValue({ ...cart, total: 16.90, items: [{ ...cart.items[0], quantity: 1 }] })
  mount(<Storefront />)
  const button = await screen.findByRole('button', { name: 'Adicionar Chocolate Belga' })
  await waitFor(() => expect(button).toBeEnabled())
  await userEvent.click(button)
  await waitFor(() => expect(mocked.quantity).toHaveBeenCalledWith('cart-1', 1, 1))
  expect(localStorage.getItem('doce-atelie-cart')).toBe('cart-1')
  expect(await screen.findByRole('status')).toHaveTextContent('adicionado ao carrinho')
})

it('recupera carrinho do servidor e altera quantidade', async () => {
  localStorage.setItem('doce-atelie-cart', 'cart-1')
  mocked.quantity.mockResolvedValue({ ...cart, total: 50.70, items: [{ ...cart.items[0], quantity: 3 }] })
  mount(<CartPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Aumentar Chocolate Belga' }))
  await waitFor(() => expect(mocked.quantity).toHaveBeenCalledWith('cart-1', 1, 3))
  expect(screen.getByLabelText('Quantidade de Chocolate Belga')).toHaveTextContent('3')
})

it('remove item do carrinho pela API', async () => {
  localStorage.setItem('doce-atelie-cart', 'cart-1'); mocked.quantity.mockResolvedValue({ ...cart, total: 0, items: [] })
  mount(<CartPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Remover' }))
  expect(await screen.findByText('Seu carrinho está vazio')).toBeInTheDocument()
  expect(mocked.quantity).toHaveBeenCalledWith('cart-1', 1, 0)
})

it('salva cadastro de produto na API', async () => {
  mount(<AdminPage />)
  document.querySelectorAll('[required]').forEach(input => {
    expect(input.closest('label')?.querySelector('.required-mark')).toBeInTheDocument()
  })
  await userEvent.type(screen.getByLabelText(/^Nome\s*\*?$/), 'Morango')
  await userEvent.type(screen.getByLabelText(/^Descrição\s*\*?$/), 'Cupcake artesanal de morango.')
  await userEvent.type(screen.getByLabelText(/^Preço\ \(R\$\)\s*\*?$/), '18.50')
  await userEvent.type(screen.getByLabelText(/^URL\ da\ imagem\s*\*?$/), '/images/morango.svg')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar produto' }))
  await waitFor(() => expect(mocked.saveProduct).toHaveBeenCalledWith({ name: 'Morango', description: 'Cupcake artesanal de morango.', price: 18.50, imageUrl: '/images/morango.svg' }, undefined))
  expect(await screen.findByText('Produto salvo com sucesso.')).toBeInTheDocument()
})

it('valida campos obrigatórios antes de finalizar', async () => {
  localStorage.setItem('doce-atelie-cart', 'cart-1')
  mount(<CheckoutPage />)
  await screen.findByRole('button', { name: 'Confirmar pedido e simular pagamento' })
  document.querySelectorAll('[required]').forEach(input => {
    expect(input.closest('label')?.querySelector('.required-mark')).toBeInTheDocument()
  })
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' }))
  expect(mocked.customer).not.toHaveBeenCalled(); expect(mocked.checkout).not.toHaveBeenCalled()
})

it('persiste cliente e envia entrega e simulação para finalizar o pedido', async () => {
  localStorage.setItem('doce-atelie-cart', 'cart-1')
  mocked.customer.mockResolvedValue(cart)
  mocked.checkout.mockResolvedValue({ id: 1 } as Awaited<ReturnType<typeof shop.checkout>>)
  mount(<CheckoutPage />)
  await screen.findByLabelText(/^Nome\ completo\s*\*?$/)
  await userEvent.type(screen.getByLabelText(/^Nome\ completo\s*\*?$/), 'Ana Silva')
  await userEvent.type(screen.getByLabelText(/^E-mail\s*\*?$/), 'ana@example.com')
  await userEvent.type(screen.getByLabelText(/^Telefone\ com\ DDD\s*\*?$/), '11999999999')
  await userEvent.type(screen.getByLabelText(/^CEP\s*\*?$/), '01310-100')
  await userEvent.selectOptions(screen.getByLabelText(/^Estado\ \(UF\)\s*\*?$/), 'SP')
  await userEvent.type(screen.getByLabelText(/^Rua \/ avenida\s*\*?$/), 'Avenida Paulista')
  await userEvent.type(screen.getByLabelText(/^Número\s*\*?$/), '100')
  await userEvent.type(screen.getByLabelText(/^Bairro\s*\*?$/), 'Bela Vista')
  await userEvent.type(screen.getByLabelText(/^Cidade\s*\*?$/), 'São Paulo')
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido e simular pagamento' }))
  await waitFor(() => expect(mocked.checkout).toHaveBeenCalledWith('cart-1', expect.objectContaining({ expectedTotal: 33.80, postalCode: '01310100', street: 'Avenida Paulista', paymentSimulation: 'approved' })))
  expect(mocked.customer).toHaveBeenCalledWith('cart-1', { name: 'Ana Silva', email: 'ana@example.com', phone: '11999999999' })
  expect(localStorage.getItem('doce-atelie-cart')).toBeNull()
  expect(localStorage.getItem('doce-atelie-orders')).toBe('["cart-1"]')
})

it('exibe histórico consultado no back-end', async () => {
  localStorage.setItem('doce-atelie-orders', '["cart-1"]')
  mocked.order.mockResolvedValue({ id: 1, total: 33.80, customerName: 'Ana Silva', customerEmail: 'ana@example.com', paymentStatus: 'Aprovado (simulado)', createdAt: '2026-11-17T12:00:00Z', street: 'Paulista', number: '100', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', postalCode: '01310100', complement: '', cartId: 'cart-1', items: [{ productName: product.name, quantity: 2, unitPrice: 16.90 }] })
  mount(<OrdersPage />)
  expect(await screen.findByText('Pedido #0001')).toBeInTheDocument()
  expect(mocked.order).toHaveBeenCalledWith('cart-1')
  expect(screen.getByText('Aprovado (simulado)')).toBeInTheDocument()
})
