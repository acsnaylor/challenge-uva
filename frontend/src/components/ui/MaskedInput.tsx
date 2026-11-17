import { Input, type InputProps } from './input'

export const digitsOnly = (value: string) => value.replace(/\D/g, '')

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  const number = digits.slice(2)
  const split = number.length > 8 ? 5 : 4
  return `(${digits.slice(0, 2)}) ${number.slice(0, split)}${number.length > split ? `-${number.slice(split)}` : ''}`
}

function formatPostalCode(value: string) {
  const digits = digitsOnly(value).slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

interface MaskedInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  mask: 'phone' | 'postalCode'
  value: string
  onChange: (value: string) => void
  inputRef?: React.Ref<HTMLInputElement>
}

// The form stores digits, while the input presents the readable mask.
export function MaskedInput({ mask, value, onChange, inputRef, ...props }: MaskedInputProps) {
  const limit = mask === 'phone' ? 11 : 8
  const format = mask === 'phone' ? formatPhone : formatPostalCode
  return <Input {...props} ref={inputRef} inputMode="numeric" value={format(value)}
    onChange={event => {
      const input = event.currentTarget
      const position = input.selectionStart ?? input.value.length
      const digitsBeforeCursor = digitsOnly(input.value.slice(0, position)).length
      const next = digitsOnly(input.value).slice(0, limit)
      onChange(next)
      // Preserve the edit position when correcting a digit in the middle.
      const formatted = format(next)
      let cursor = 0
      let seen = 0
      while (cursor < formatted.length && seen < digitsBeforeCursor) {
        if (/\d/.test(formatted[cursor])) seen++
        cursor++
      }
      input.value = formatted
      input.setSelectionRange(cursor, cursor)
    }} />
}
