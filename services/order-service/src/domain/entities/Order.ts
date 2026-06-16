export interface CustomResourceConfig {
  vCPUs: number;
  ramGB: number;
  storageGB: number;
  region: string;
  tier: 'Basic' | 'Standard' | 'Premium';
  monthlyRate: number;
}

export interface OrderItem {
  id: string;
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

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
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
  bicepCode?: string;
}

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
}
