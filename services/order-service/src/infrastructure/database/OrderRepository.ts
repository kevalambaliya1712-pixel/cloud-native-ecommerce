import sqlite3 from 'sqlite3';
import { Order, OrderItem, IOrderRepository } from '../../domain/entities/Order.js';
import pathLib from 'path';
import path from 'url';

const __dirname = pathLib.dirname(path.fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || pathLib.join(__dirname, '../../../../orders.sqlite');

export class SQLiteOrderRepository implements IOrderRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to Order database:', err.message);
      } else {
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          subtotal REAL NOT NULL,
          shipping REAL NOT NULL,
          tax REAL NOT NULL,
          discount REAL NOT NULL,
          total REAL NOT NULL,
          date TEXT NOT NULL,
          email TEXT NOT NULL,
          shippingName TEXT NOT NULL,
          shippingAddress TEXT NOT NULL,
          shippingCity TEXT NOT NULL,
          shippingZip TEXT NOT NULL,
          paymentMethod TEXT NOT NULL,
          armTemplate TEXT,
          cliScript TEXT,
          bicepCode TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          orderId TEXT NOT NULL,
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
          PRIMARY KEY (orderId, id),
          FOREIGN KEY (orderId) REFERENCES orders (id)
        )
      `);
    });
  }

  public create(order: Order): Promise<Order> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `INSERT INTO orders (
            id, userId, subtotal, shipping, tax, discount, total, date, email, shippingName, shippingAddress, shippingCity, shippingZip, paymentMethod, armTemplate, cliScript, bicepCode
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id, order.userId, order.subtotal, order.shipping, order.tax, order.discount, order.total,
            order.date, order.email, order.shippingName, order.shippingAddress, order.shippingCity, order.shippingZip,
            order.paymentMethod, order.armTemplate || null, order.cliScript || null, order.bicepCode || null
          ],
          (err) => {
            if (err) return reject(err);

            const stmt = this.db.prepare(`
              INSERT INTO order_items (
                orderId, id, productId, productName, productPrice, productImage, isAzureResource, sku, quantity, selectedColor, customConfig
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let count = 0;
            for (const item of order.items) {
              stmt.run(
                order.id,
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
                (itemErr: any) => {
                  if (itemErr) {
                    stmt.finalize();
                    return reject(itemErr);
                  }
                  count++;
                  if (count === order.items.length) {
                    stmt.finalize();
                    resolve(order);
                  }
                }
              );
            }
          }
        );
      });
    });
  }

  public findById(id: string): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        this.db.all('SELECT * FROM order_items WHERE orderId = ?', [id], (itemErr, itemRows: any[]) => {
          if (itemErr) return reject(itemErr);

          const items: OrderItem[] = itemRows.map(itemRow => ({
            id: itemRow.id,
            productId: itemRow.productId,
            productName: itemRow.productName,
            productPrice: itemRow.productPrice,
            productImage: itemRow.productImage,
            isAzureResource: itemRow.isAzureResource === 1,
            sku: itemRow.sku,
            quantity: itemRow.quantity,
            selectedColor: itemRow.selectedColor || undefined,
            customConfig: itemRow.customConfig ? JSON.parse(itemRow.customConfig) : undefined,
          }));

          resolve({
            id: row.id,
            userId: row.userId,
            items,
            subtotal: row.subtotal,
            shipping: row.shipping,
            tax: row.tax,
            discount: row.discount,
            total: row.total,
            date: row.date,
            email: row.email,
            shippingName: row.shippingName,
            shippingAddress: row.shippingAddress,
            shippingCity: row.shippingCity,
            shippingZip: row.shippingZip,
            paymentMethod: row.paymentMethod,
            armTemplate: row.armTemplate || undefined,
            cliScript: row.cliScript || undefined,
            bicepCode: row.bicepCode || undefined,
          });
        });
      });
    });
  }

  public findByUserId(userId: string): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM orders WHERE userId = ?', [userId], async (err, rows: any[]) => {
        if (err) return reject(err);
        if (rows.length === 0) return resolve([]);

        try {
          const orders: Order[] = [];
          for (const row of rows) {
            const order = await this.findById(row.id);
            if (order) orders.push(order);
          }
          resolve(orders);
        } catch (itemErr) {
          reject(itemErr);
        }
      });
    });
  }
}
