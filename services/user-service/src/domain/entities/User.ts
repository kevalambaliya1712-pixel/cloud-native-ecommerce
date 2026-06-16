export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: 'customer' | 'admin';
  createdAt: Date;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt'>): Promise<User>;
}
