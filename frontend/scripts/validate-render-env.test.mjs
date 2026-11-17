import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateRenderApiUrl } from './validate-render-env.mjs'

test('aceita origem HTTPS e barra final', () => {
  assert.equal(validateRenderApiUrl(' https://api.example.invalid/ '), 'https://api.example.invalid')
})
test('impede build publicado sem URL da API', () => {
  assert.throws(() => validateRenderApiUrl(undefined), /VITE_API_BASE_URL/)
})
test('rejeita localhost, caminhos, HTTP e credenciais no front-end', () => {
  for (const value of ['http://api.example.invalid', 'https://localhost', 'https://127.0.0.1',
    'https://api.example.invalid/api', 'https://user:secret@api.example.invalid', 'https://api.example.invalid/?token=x', 'inválido']) {
    assert.throws(() => validateRenderApiUrl(value))
  }
})
