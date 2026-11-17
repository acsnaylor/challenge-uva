// Requires the updated API to be running; creates one demonstrative contact message.
import assert from 'node:assert/strict'
const base = process.argv[2] || 'http://localhost:5000'
const valid = { name: 'Cliente de demonstração', email: 'contato@example.com', subject: 'Avaliação PIT II', message: 'Mensagem de teste de integração do formulário Fale Conosco.' }
async function send(body, status) {
  const response = await fetch(`${base}/api/contact-messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const result = await response.json()
  assert.equal(response.status, status, JSON.stringify(result))
  return result
}
await send({ ...valid, name: '' }, 400)
await send({ ...valid, email: 'inválido' }, 400)
await send({ ...valid, message: ' ' }, 400)
await send({ ...valid, message: 'x'.repeat(3001) }, 400)
const receipt = await send(valid, 201)
assert.ok(receipt.id > 0)
assert.match(receipt.confirmation, /recebida com sucesso/)
assert.ok(!('email' in receipt) && !('message' in receipt))
console.log(`Contato HTTP aprovado: validações e recebimento. Protocolo #${receipt.id}.`)
