import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MaskedInput } from '../components/ui/MaskedInput'

function Form({ mask, initial = '' }: { mask: 'phone' | 'postalCode'; initial?: string }) {
  const [value, setValue] = useState(initial)
  return <><label>Campo<MaskedInput mask={mask} value={value} onChange={setValue} /></label><output aria-label="Valor enviado">{value}</output></>
}

it('formata telefone digitado e mantém apenas dígitos para envio', async () => {
  render(<Form mask="phone" />)
  await userEvent.type(screen.getByLabelText('Campo'), '11999999999')
  expect(screen.getByLabelText('Campo')).toHaveValue('(11) 99999-9999')
  expect(screen.getByLabelText('Valor enviado')).toHaveTextContent('11999999999')
  await userEvent.clear(screen.getByLabelText('Campo'))
  expect(screen.getByLabelText('Campo')).toHaveValue('')
})

it('aceita colagem formatada e preserva telefones válidos de dez dígitos', async () => {
  render(<Form mask="phone" initial="1133334444" />)
  const input = screen.getByLabelText('Campo')
  expect(input).toHaveValue('(11) 3333-4444')
  await userEvent.clear(input)
  await userEvent.click(input)
  await userEvent.paste('(21) 98888-7777')
  expect(input).toHaveValue('(21) 98888-7777')
  expect(screen.getByLabelText('Valor enviado')).toHaveTextContent('21988887777')
})

it('formata CEP colado, remove caracteres não numéricos e permite corrigir', async () => {
  render(<Form mask="postalCode" />)
  const input = screen.getByLabelText('Campo')
  await userEvent.click(input)
  await userEvent.paste('01310-100')
  expect(input).toHaveValue('01310-100')
  expect(screen.getByLabelText('Valor enviado')).toHaveTextContent('01310100')
  await userEvent.keyboard('{Backspace}')
  expect(input).toHaveValue('01310-10')
  await userEvent.type(input, '1')
  expect(input).toHaveValue('01310-101')
})
