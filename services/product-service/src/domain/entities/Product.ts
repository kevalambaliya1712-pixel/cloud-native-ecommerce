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

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findReviewsByProductId(productId: string): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;
}
