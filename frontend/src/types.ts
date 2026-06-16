/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Compute & VM' | 'Data & Storage' | 'IoT DevKit' | 'Apparel & Gear' | 'Smart Workspace';
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  thumbnails: string[];
  rating: number;
  ratingCount: number;
  badge?: string;
  isAzureResource: boolean;
  specs: Record<string, string>;
  isOutOfStock?: boolean;
}

export interface CustomResourceConfig {
  vCPUs: number;
  ramGB: number;
  storageGB: number;
  region: string;
  tier: 'Basic' | 'Standard' | 'Premium';
  monthlyRate: number;
}

export interface CartItem {
  id: string; // unique item id (composite of product.id + selected color or custom config to separate items)
  product: Product;
  quantity: number;
  selectedColor?: string;
  customConfig?: CustomResourceConfig;
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
  date: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  paymentMethod: string;
  armTemplate?: string;
  cliScript?: string;
}
