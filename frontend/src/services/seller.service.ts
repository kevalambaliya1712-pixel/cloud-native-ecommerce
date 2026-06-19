import { request } from './api.js';
import { Seller } from '../types.js';

export async function getSellers(): Promise<Seller[]> {
  return request('/sellers');
}

export async function getSellerById(id: string): Promise<Seller> {
  return request(`/sellers/${id}`);
}

export async function updateSellerProfile(fields: {
  name?: string;
  storeName?: string;
  storeDescription?: string;
  phone?: string;
}): Promise<any> {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}
