import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type ToastVariant = 'info' | 'success' | 'error'
type ToastItem = { id: number; message: string; variant: ToastVariant; duration: number }
type ToastContextValue = { show: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('ToastProvider ausente')
  return context
}

function Toast({ item, remove }: { item: ToastItem; remove: (id: number) => void }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const remaining = useRef(item.duration)
  const paused = hovered || focused
  useEffect(() => {
    if (paused || item.duration === 0) return
    const started = Date.now()
    const timer = window.setTimeout(() => remove(item.id), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - started))
    }
  }, [paused, item.id, item.duration, remove])
  return <div className={`toast toast-${item.variant}`}
    role={item.variant === 'error' ? 'alert' : 'status'} aria-atomic="true"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div><strong>{item.variant === 'error' ? 'Erro' : item.variant === 'success' ? 'Sucesso' : 'Aviso'}</strong>
      <p>{item.message}</p></div>
    <button type="button" aria-label="Fechar notificação" onClick={() => remove(item.id)}>×</button>
  </div>
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const active = useRef(new Map<string, ToastItem>())
  const sequence = useRef(0)
  const remove = useCallback((id: number) => {
    for (const [key, item] of active.current) if (item.id === id) active.current.delete(key)
    setToasts(previous => previous.filter(item => item.id !== id))
  }, [])
  const show = useCallback<ToastContextValue['show']>((message, options) => {
    if (!message.trim()) return
    const variant = options?.variant ?? 'info'
    const key = `${variant}:${message.trim()}`
    if (active.current.has(key)) return
    const duration = options?.duration === 0 ? 0 : Math.max(
      options?.duration ?? 0, variant === 'error' ? 12000 : 8000, message.length * 65,
    )
    const item = { id: ++sequence.current, message: message.trim(), variant, duration }
    active.current.set(key, item)
    setToasts(previous => [...previous, item])
  }, [])
  const value = useMemo(() => ({ show }), [show])
  return <ToastContext.Provider value={value}>
    {children}
    <div className="toast-viewport" role="region" aria-label="Notificações">
      {toasts.map(item => <Toast key={item.id} item={item} remove={remove} />)}
    </div>
  </ToastContext.Provider>
}
