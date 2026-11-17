import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { shop, type Cart } from '../services/shop'

const key = 'doce-atelie-cart'
interface Store {
  cart: Cart | null; loading: boolean; busy: boolean; error: string;
  setError: (value: string) => void;
  getCart: () => Promise<Cart>;
  updateCart: (cart: Cart) => void;
  changeQuantity: (productId: number, quantity: number) => Promise<void>;
  finish: (cartId: string) => void;
}
const Context = createContext<Store | null>(null)
export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const updateCart = (value: Cart) => { localStorage.setItem(key, value.id); setCart(value) }
  useEffect(() => {
    let live = true
    const id = localStorage.getItem(key)
    if (!id) { setLoading(false); return }
    shop.cart(id).then(value => { if (live) setCart(value) }).catch(e => {
      if (live) {
        if (e.response?.status === 404) localStorage.removeItem(key)
        else setError('Não foi possível recuperar o carrinho. Atualize a página para tentar novamente.')
      }
    }).finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [])
  const getCart = async () => {
    if (cart && !cart.completed) return cart
    const value = await shop.createCart(); updateCart(value); return value
  }
  const changeQuantity = async (productId: number, quantity: number) => {
    if (lock.current) return
    lock.current = true; setBusy(true)
    try { const current = await getCart(); updateCart(await shop.quantity(current.id, productId, quantity)) }
    finally { lock.current = false; setBusy(false) }
  }
  const finish = (id: string) => {
    localStorage.setItem('doce-atelie-customer-cart', id)
    const orders: string[] = JSON.parse(localStorage.getItem('doce-atelie-orders') || '[]')
    localStorage.setItem('doce-atelie-orders', JSON.stringify([...new Set([...orders, id])]))
    localStorage.removeItem(key); setCart(null)
  }
  return <Context.Provider value={{ cart, loading, busy, error, setError, getCart, updateCart, changeQuantity, finish }}>{children}</Context.Provider>
}
export function useShop() { const value = useContext(Context); if (!value) throw new Error('ShopProvider ausente'); return value }
