import { api } from './apiClient'

export interface Product { id: number; name: string; description: string; price: number; imageUrl: string }
export type ProductInput = Omit<Product, 'id'>
export interface Customer { id: number; name: string; email: string; phone: string }
export interface CartLine { productId: number; name: string; imageUrl: string; unitPrice: number; quantity: number; available: boolean }
export interface Cart { id: string; customer: Customer | null; completed: boolean; items: CartLine[]; total: number }
export interface Delivery { postalCode: string; street: string; number: string; neighborhood: string; city: string; state: string; complement: string }
export interface Order extends Delivery { id: number; cartId: string; customerName: string; customerEmail: string; total: number; paymentStatus: string; createdAt: string; items: { productName: string; unitPrice: number; quantity: number }[] }
export const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const errorMessage = (error: unknown): string => {
  const e = error as { response?: { data?: { title?: string; errors?: Record<string, string[]> } } }
  const data = e.response?.data
  return data?.errors ? Object.values(data.errors).flat().join(' ') : data?.title || 'Não foi possível conectar à loja. Verifique se a API está em execução.'
}
export const shop = {
  products: async () => (await api.get<Product[]>('/api/products')).data,
  saveProduct: async (data: ProductInput, id?: number) => (id ? await api.put(`/api/products/${id}`, data) : await api.post('/api/products', data)).data,
  deleteProduct: async (id: number) => { await api.delete(`/api/products/${id}`) },
  createCart: async (): Promise<Cart> => {
    try { return (await api.post<Cart>('/api/carts', null, { params: { previousCartId: localStorage.getItem('doce-atelie-customer-cart') || undefined } })).data }
    catch (error) {
      if ((error as { response?: { status: number } }).response?.status !== 404) throw error
      localStorage.removeItem('doce-atelie-customer-cart')
      return (await api.post<Cart>('/api/carts')).data
    }
  },
  cart: async (id: string) => (await api.get<Cart>(`/api/carts/${id}`)).data,
  quantity: async (id: string, productId: number, quantity: number) => (await api.put<Cart>(`/api/carts/${id}/items/${productId}`, { quantity })).data,
  customer: async (id: string, data: Omit<Customer, 'id'>) => (await api.put<Cart>(`/api/carts/${id}/customer`, data)).data,
  checkout: async (id: string, data: Delivery & { paymentSimulation: string; expectedTotal: number }) => (await api.post<Order>(`/api/carts/${id}/checkout`, data)).data,
  order: async (id: string) => (await api.get<Order>(`/api/carts/${id}/order`)).data,
}
