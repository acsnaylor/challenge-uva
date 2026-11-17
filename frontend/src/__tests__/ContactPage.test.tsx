import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactPage } from '../pages/Store/ContactPage'
import { ToastProvider } from '../components/ui/toast'
import { shop } from '../services/shop'

jest.mock('../services/shop', () => ({ shop: { contact: jest.fn() }, errorMessage: () => 'Não foi possível enviar a mensagem.' }))
const mocked = jest.mocked(shop)
beforeEach(() => jest.resetAllMocks())
function setup() { render(<ToastProvider><ContactPage /></ToastProvider>) }
async function fill() {
  await userEvent.type(screen.getByLabelText(/^Nome/), 'Ana Silva')
  await userEvent.type(screen.getByLabelText(/^E-mail/), 'ana@example.com')
  await userEvent.type(screen.getByLabelText(/^Assunto/), 'Dúvida sobre sabores')
  await userEvent.type(screen.getByLabelText(/^Mensagem/), 'Quais cupcakes estão disponíveis?')
}

it('identifica campos obrigatórios e impede envio vazio ou com e-mail inválido', async () => {
  setup()
  document.querySelectorAll('[required]').forEach(input => {
    expect(input.closest('label')?.querySelector('.required-mark')).toBeInTheDocument()
  })
  await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
  expect(mocked.contact).not.toHaveBeenCalled()
  await fill()
  await userEvent.clear(screen.getByLabelText(/^E-mail/))
  await userEvent.type(screen.getByLabelText(/^E-mail/), 'inválido')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
  expect(mocked.contact).not.toHaveBeenCalled()
})

it('envia à API e confirma com protocolo depois da resposta', async () => {
  mocked.contact.mockResolvedValue({ id: 7, createdAt: '2026-11-17T12:00:00Z', confirmation: 'Mensagem recebida com sucesso.' })
  setup(); await fill()
  await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Mensagem recebida com sucesso. Protocolo #7.')
  expect(mocked.contact).toHaveBeenCalledWith({ name: 'Ana Silva', email: 'ana@example.com', subject: 'Dúvida sobre sabores', message: 'Quais cupcakes estão disponíveis?' })
  expect(screen.getByLabelText(/^Mensagem/)).toHaveValue('')
})

it('não duplica envio pendente nem apresenta sucesso antes da API confirmar', async () => {
  let resolve!: (value: Awaited<ReturnType<typeof shop.contact>>) => void
  mocked.contact.mockReturnValue(new Promise(done => { resolve = done }))
  setup(); await fill()
  const button = screen.getByRole('button', { name: 'Enviar mensagem' })
  await userEvent.click(button)
  await waitFor(() => expect(button).toBeDisabled())
  await act(async () => { fireEvent.submit(button.closest('form')!) })
  expect(mocked.contact).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  resolve({ id: 9, createdAt: '2026-11-17T12:00:00Z', confirmation: 'Mensagem recebida.' })
  expect(await screen.findByRole('status')).toHaveTextContent('Protocolo #9')
})

it('exibe erro e mantém o conteúdo para nova tentativa', async () => {
  mocked.contact.mockRejectedValue(new Error('Network error'))
  setup(); await fill()
  await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar a mensagem.')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getByLabelText(/^Mensagem/)).toHaveValue('Quais cupcakes estão disponíveis?')
  expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeEnabled()
})
