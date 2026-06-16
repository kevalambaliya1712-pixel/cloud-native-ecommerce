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
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
  }

  public findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          id: row.id,
          email: row.email,
          passwordHash: row.passwordHash,
          name: row.name,
          role: row.role as 'customer' | 'admin',
          createdAt: new Date(row.createdAt),
        });
      });
    });
  }

  public findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          id: row.id,
          email: row.email,
          passwordHash: row.passwordHash,
          name: row.name,
          role: row.role as 'customer' | 'admin',
          createdAt: new Date(row.createdAt),
        });
      });
    });
  }

  public create(user: Omit<User, 'createdAt'>): Promise<User> {
    const createdAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, email, passwordHash, name, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.name || null, user.role, createdAt],
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
}
