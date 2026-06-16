import sqlite3 from 'sqlite3';
import { Cart, CartItem, ICartRepository } from '../../domain/entities/Cart.js';
import pathLib from 'path';
import path from 'url';

const __dirname = pathLib.dirname(path.fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || pathLib.join(__dirname, '../../../../carts.sqlite');

export class SQLiteCartRepository implements ICartRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to Cart database:', err.message);
      } else {
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        userId TEXT NOT NULL,
        id TEXT NOT NULL,
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        productPrice REAL NOT NULL,
        productImage TEXT NOT NULL,
        isAzureResource INTEGER NOT NULL,
        sku TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        selectedColor TEXT,
        customConfig TEXT,
        PRIMARY KEY (userId, id)
      )
    `);
  }

  public findByUserId(userId: string): Promise<Cart> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM cart_items WHERE userId = ?', [userId], (err, rows: any[]) => {
        if (err) return reject(err);
        const items: CartItem[] = rows.map(row => ({
          id: row.id,
          productId: row.productId,
          productName: row.productName,
          productPrice: row.productPrice,
          productImage: row.productImage,
          isAzureResource: row.isAzureResource === 1,
          sku: row.sku,
          quantity: row.quantity,
          selectedColor: row.selectedColor || undefined,
          customConfig: row.customConfig ? JSON.parse(row.customConfig) : undefined,
        }));
        resolve({ userId, items });
      });
    });
  }

  public save(cart: Cart): Promise<Cart> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Clear old items
        this.db.run('DELETE FROM cart_items WHERE userId = ?', [cart.userId], (err) => {
          if (err) return reject(err);

          if (cart.items.length === 0) {
            return resolve(cart);
          }

          // Insert new items
          const stmt = this.db.prepare(`
            INSERT INTO cart_items (
              userId, id, productId, productName, productPrice, productImage, isAzureResource, sku, quantity, selectedColor, customConfig
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          let count = 0;
          for (const item of cart.items) {
            stmt.run(
              cart.userId,
              item.id,
              item.productId,
              item.productName,
              item.productPrice,
              item.productImage,
              item.isAzureResource ? 1 : 0,
              item.sku,
              item.quantity,
              item.selectedColor || null,
              item.customConfig ? JSON.stringify(item.customConfig) : null,
              (runErr: any) => {
                if (runErr) {
                  stmt.finalize();
                  return reject(runErr);
                }
                count++;
                if (count === cart.items.length) {
                  stmt.finalize();
                  resolve(cart);
                }
              }
            );
          }
        });
      });
    });
  }

  public clear(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM cart_items WHERE userId = ?', [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
