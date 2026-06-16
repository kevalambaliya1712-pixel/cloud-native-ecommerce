import { request } from './api.js';

export async function fetchCart() {
  return request('/cart');
}

export async function addToCart(item: {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  isAzureResource: boolean;
  sku: string;
  quantity: number;
  selectedColor?: string;
  customConfig?: any;
}) {
  return request('/cart/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  return request(`/cart/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(id: string) {
  return request(`/cart/items/${id}`, {
    method: 'DELETE',
  });
}

export async function clearCart() {
  return request('/cart', {
    method: 'DELETE',
  });
}
