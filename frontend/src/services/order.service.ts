import { request } from './api.js';

export async function placeOrder(orderData: {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  paymentMethod: string;
}) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function fetchOrders() {
  return request('/orders');
}

export async function fetchOrderById(id: string) {
  return request(`/orders/${id}`);
}
