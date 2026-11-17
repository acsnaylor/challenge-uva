import { pathToFileURL } from 'node:url'

export function validateRenderApiUrl(value) {
  if (!value?.trim()) throw new Error('Cadastre VITE_API_BASE_URL no Static Site com a URL pública da API fornecida pelo Render.')
  let url
  try { url = new URL(value.trim()) } catch { throw new Error('VITE_API_BASE_URL deve ser uma URL HTTPS válida.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('VITE_API_BASE_URL deve conter somente a origem HTTPS pública da API, sem /api, credenciais ou parâmetros.')
  }
  return url.origin
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateRenderApiUrl(process.env.VITE_API_BASE_URL)
  console.log('URL pública da API configurada para o build do Render.')
}
