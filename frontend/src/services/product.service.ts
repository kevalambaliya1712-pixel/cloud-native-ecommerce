import { request } from './api.js';
import { Product, Review } from '../types.js';

export async function getProducts(): Promise<Product[]> {
  return request('/products');
}

export async function getProductById(id: string): Promise<Product> {
  return request(`/products/${id}`);
}

export async function getProductReviews(id: string): Promise<Review[]> {
  return request(`/products/${id}/reviews`);
}

export async function submitProductReview(
  id: string,
  review: { author: string; rating: number; title: string; body: string }
): Promise<Review> {
  return request(`/products/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  return request(`/products/seller/${sellerId}`);
}

export async function createProduct(product: {
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  stock: number;
  badge?: string;
  specs?: Record<string, string>;
  sellerName?: string;
}): Promise<Product> {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: string, fields: Partial<Product>): Promise<Product> {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return request(`/products/${id}`, {
    method: 'DELETE',
  });
}
