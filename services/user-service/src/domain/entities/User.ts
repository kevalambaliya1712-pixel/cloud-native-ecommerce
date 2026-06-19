export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: 'customer' | 'seller' | 'admin';
  storeName?: string;
  storeDescription?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt'>): Promise<User>;
  update(id: string, fields: Partial<Pick<User, 'name' | 'storeName' | 'storeDescription' | 'phone'>>): Promise<User | null>;
  findAllSellers(): Promise<User[]>;
}
