import axios from 'axios'
import { getToken } from './tokenStorage'

const baseURL = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:5000'

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function listProducts() {
  const { data } = await client.get('/products')
  return data
}

export async function getProduct(id) {
  const { data } = await client.get(`/products/${id}`)
  return data
}

export async function createProduct(body) {
  const { data } = await client.post('/products', body)
  return data
}

export async function updateProduct(id, body) {
  const { data } = await client.put(`/products/${id}`, body)
  return data
}

export async function deleteProduct(id) {
  const { data } = await client.delete(`/products/${id}`)
  return data
}
