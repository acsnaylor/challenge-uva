// Run against an already started API: node scripts/smoke-test.mjs http://localhost:5000
// After restarting that API: node scripts/smoke-test.mjs http://localhost:5000 <cartId>
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = process.argv[2] || 'http://localhost:5000'
async function request(path, method = 'GET', body, status = 200) {
  const response = await fetch(`${base}/api${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  assert.equal(response.status, status, `${method} ${path}: ${text}`)
  return text ? JSON.parse(text) : null
}

if (process.argv[3]) {
  const order = await request(`/carts/${process.argv[3]}/order`)
  assert.equal(order.total, 50.70)
  assert.equal(order.items[0].productName, 'Cupcake de teste HTTP')
  console.log(`Persistência após reinício confirmada: pedido #${order.id}, total R$ ${order.total.toFixed(2)}.`)
} else {
  const productData = { name: 'Cupcake de teste HTTP', description: 'Produto criado para validar a integração real da loja.', price: 16.90, imageUrl: '/images/chocolate.svg' }
  const product = await request('/products', 'POST', productData, 201)
  await request('/products', 'POST', { ...productData, price: -1 }, 400)
  const cart = await request('/carts', 'POST', undefined, 201)
  await request(`/carts/${randomUUID()}`, 'GET', undefined, 404)
  await request(`/carts/${cart.id}/items/${product.id}`, 'PUT', { quantity: 100 }, 400)
  let updated = await request(`/carts/${cart.id}/items/${product.id}`, 'PUT', { quantity: 2 })
  assert.equal(updated.total, 33.80)
  updated = await request(`/carts/${cart.id}/items/${product.id}`, 'PUT', { quantity: 3 })
  assert.equal(updated.total, 50.70)
  await request(`/carts/${cart.id}/customer`, 'PUT', { name: 'Cliente Teste', email: `teste-${randomUUID()}@example.com`, phone: '11999999999' })
  const delivery = { postalCode: '01310-100', street: 'Avenida Paulista', number: '100', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', complement: '', paymentSimulation: 'approved', expectedTotal: 50.70 }
  await request(`/carts/${cart.id}/checkout`, 'POST', { ...delivery, postalCode: 'inválido' }, 400)
  await request(`/carts/${cart.id}/checkout`, 'POST', { ...delivery, expectedTotal: 1 }, 409)
  await request(`/carts/${cart.id}/checkout`, 'POST', { ...delivery, paymentSimulation: 'declined' }, 422)
  assert.equal((await request(`/carts/${cart.id}`)).completed, false)
  const order = await request(`/carts/${cart.id}/checkout`, 'POST', delivery)
  assert.equal(order.total, 50.70)
  assert.equal((await request(`/carts/${cart.id}/checkout`, 'POST', delivery)).id, order.id)
  await request(`/carts/${cart.id}/items/${product.id}`, 'PUT', { quantity: 1 }, 409)
  await request(`/products/${product.id}`, 'DELETE', undefined, 204)
  assert.equal((await request('/products')).some(p => p.id === product.id), false)
  const saved = await request(`/carts/${cart.id}/order`)
  assert.equal(saved.items[0].unitPrice, 16.90)
  assert.equal(saved.city, 'São Paulo')
  assert.equal(saved.customerName, 'Cliente Teste')
  const nextCart = await request(`/carts?previousCartId=${cart.id}`, 'POST', undefined, 201)
  assert.equal(nextCart.customer.id, updated.customer?.id || saved.customerId)
  assert.equal(nextCart.items.length, 0)
  console.log('Fluxo HTTP aprovado: produtos, validações, carrinho, cliente, entrega, recusa, aprovação, idempotência e histórico.')
  console.log(JSON.stringify({ cartId: cart.id, orderId: order.id, total: order.total }))
}
