import { act, fireEvent, render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from '../components/ui/toast'

function Actions() {
  const { show } = useToast()
  return <><button onClick={() => show('Produto salvo.', { variant: 'success' })}>Sucesso</button>
    <button onClick={() => show('Não foi possível salvar.', { variant: 'error' })}>Erro</button></>
}
beforeEach(() => jest.useFakeTimers())
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers() })
function setup() { render(<ToastProvider><Actions /></ToastProvider>) }

it('diferencia sucesso e erro com texto, cor e anúncios acessíveis sem duplicar', () => {
  setup()
  fireEvent.click(screen.getByRole('button', { name: 'Sucesso' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sucesso' }))
  fireEvent.click(screen.getByRole('button', { name: 'Erro' }))
  expect(screen.getAllByText('Produto salvo.')).toHaveLength(1)
  expect(screen.getByRole('status')).toHaveClass('toast-success')
  expect(screen.getByRole('alert')).toHaveClass('toast-error')
  expect(screen.getByRole('region', { name: 'Notificações' })).toBeInTheDocument()
})

it('permite fechar e voltar a exibir a mesma mensagem', () => {
  setup()
  fireEvent.click(screen.getByRole('button', { name: 'Sucesso' }))
  fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Sucesso' }))
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('mantém tempo de leitura e pausa enquanto o usuário passa o mouse', () => {
  setup()
  fireEvent.click(screen.getByRole('button', { name: 'Sucesso' }))
  act(() => jest.advanceTimersByTime(7000))
  const toast = screen.getByRole('status')
  fireEvent.mouseEnter(toast)
  act(() => jest.advanceTimersByTime(30000))
  expect(toast).toBeInTheDocument()
  fireEvent.mouseLeave(toast)
  act(() => jest.advanceTimersByTime(1100))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('pausa a expiração durante navegação por teclado', () => {
  setup()
  fireEvent.click(screen.getByRole('button', { name: 'Erro' }))
  const close = screen.getByRole('button', { name: 'Fechar notificação' })
  fireEvent.focus(close)
  act(() => jest.advanceTimersByTime(30000))
  expect(screen.getByRole('alert')).toBeInTheDocument()
  fireEvent.blur(close)
  act(() => jest.advanceTimersByTime(12001))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
