import sqlite3 from 'sqlite3';
import { User, IUserRepository } from '../../domain/entities/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../../../users.sqlite');

export class SQLiteUserRepository implements IUserRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to User database:', err.message);
      } else {
        this.initializeTable();
      }
    });
  }

  private initializeTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        storeName TEXT,
        storeDescription TEXT,
        phone TEXT,
        isVerified INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role as 'customer' | 'seller' | 'admin',
      storeName: row.storeName,
      storeDescription: row.storeDescription,
      phone: row.phone,
      isVerified: row.isVerified === 1,
      createdAt: new Date(row.createdAt),
    };
  }

  public findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(this.mapRow(row));
      });
    });
  }

  public findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(this.mapRow(row));
      });
    });
  }

  public create(user: Omit<User, 'createdAt'>): Promise<User> {
    const createdAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, email, passwordHash, name, role, storeName, storeDescription, phone, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.name || null, user.role, user.storeName || null, user.storeDescription || null, user.phone || null, user.isVerified ? 1 : 0, createdAt],
        (err) => {
          if (err) return reject(err);
          resolve({
            ...user,
            createdAt: new Date(createdAt),
          });
        }
      );
    });
  }

  public update(id: string, fields: Partial<Pick<User, 'name' | 'storeName' | 'storeDescription' | 'phone'>>): Promise<User | null> {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (fields.name !== undefined) { setClauses.push('name = ?'); values.push(fields.name); }
    if (fields.storeName !== undefined) { setClauses.push('storeName = ?'); values.push(fields.storeName); }
    if (fields.storeDescription !== undefined) { setClauses.push('storeDescription = ?'); values.push(fields.storeDescription); }
    if (fields.phone !== undefined) { setClauses.push('phone = ?'); values.push(fields.phone); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) return reject(err);
          this.findById(id).then(resolve).catch(reject);
        }
      );
    });
  }

  public findAllSellers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM users WHERE role = 'seller'", [], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => this.mapRow(row)));
      });
    });
  }
}
