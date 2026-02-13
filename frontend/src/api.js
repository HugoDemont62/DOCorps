const AUTH_API = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api';
const PRODUCT_API = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

// --- Auth ---

export function login(email, password) {
  return request(`${AUTH_API}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(username, email, password) {
  return request(`${AUTH_API}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

// --- Products ---

export function getProducts() {
  return request(`${PRODUCT_API}/products`);
}

export function getProduct(id) {
  return request(`${PRODUCT_API}/products/${id}`);
}

export function createProduct(product) {
  return request(`${PRODUCT_API}/products`, {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, product) {
  return request(`${PRODUCT_API}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return request(`${PRODUCT_API}/products/${id}`, {
    method: 'DELETE',
  });
}
