/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Fashion' | 'Home & Kitchen' | 'Sports' | 'Books' | 'Beauty' | 'Toys' | 'Grocery';
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  ratingCount: number;
  badge?: string;
  stock: number;
  sellerId: string;
  sellerName: string;
  specs: Record<string, string>;
  isOutOfStock?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  paymentMethod: string;
}

export interface Seller {
  id: string;
  name?: string;
  storeName?: string;
  storeDescription?: string;
  isVerified: boolean;
  createdAt: string;
}
