export interface CustomResourceConfig {
  vCPUs: number;
  ramGB: number;
  storageGB: number;
  region: string;
  tier: 'Basic' | 'Standard' | 'Premium';
  monthlyRate: number;
}

export interface CartItem {
  id: string; // unique composite key or UUID
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  isAzureResource: boolean;
  sku: string;
  quantity: number;
  selectedColor?: string;
  customConfig?: CustomResourceConfig;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart>;
  save(cart: Cart): Promise<Cart>;
  clear(userId: string): Promise<void>;
}
