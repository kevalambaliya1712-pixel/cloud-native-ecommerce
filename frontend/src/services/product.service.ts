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

export async function optimizeArchitecture(prompt: string): Promise<any> {
  return request('/gemini/optimize', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}
