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
  findBySellerId(sellerId: string): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  findReviewsByProductId(productId: string): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;
}
