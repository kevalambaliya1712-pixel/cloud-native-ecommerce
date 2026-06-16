const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('cloudcommerce_token');
export const setAuthToken = (token: string) => localStorage.setItem('cloudcommerce_token', token);
export const removeAuthToken = () => localStorage.removeItem('cloudcommerce_token');

export async function request(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
