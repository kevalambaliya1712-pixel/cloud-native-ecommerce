import sqlite3 from 'sqlite3';
import { Product, Review, IProductRepository } from '../../domain/entities/Product.js';
import path from 'url';
import pathLib from 'path';

const __dirname = pathLib.dirname(path.fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || pathLib.join(__dirname, '../../../../products.sqlite');

export class SQLiteProductRepository implements IProductRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to Product database:', err.message);
      } else {
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    this.db.serialize(() => {
      // Products Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          brand TEXT NOT NULL DEFAULT '',
          description TEXT,
          price REAL NOT NULL,
          originalPrice REAL,
          image TEXT,
          images TEXT,
          rating REAL DEFAULT 0,
          ratingCount INTEGER DEFAULT 0,
          badge TEXT,
          stock INTEGER DEFAULT 0,
          sellerId TEXT NOT NULL DEFAULT 'system',
          sellerName TEXT NOT NULL DEFAULT 'CloudCommerce',
          specs TEXT,
          isOutOfStock INTEGER DEFAULT 0
        )
      `);

      // Reviews Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          productId TEXT NOT NULL,
          author TEXT NOT NULL,
          rating INTEGER NOT NULL,
          date TEXT NOT NULL,
          title TEXT,
          body TEXT,
          verified INTEGER,
          FOREIGN KEY (productId) REFERENCES products (id)
        )
      `);

      // Check if seed is needed
      this.db.get('SELECT COUNT(*) as count FROM products', (err, row: any) => {
        if (!err && row && row.count === 0) {
          this.seedProducts();
        }
      });
    });
  }

  private seedProducts() {
    const productsToSeed: Product[] = [
      {
        id: 'iphone-15-pro',
        name: 'Apple iPhone 15 Pro (256 GB) - Natural Titanium',
        category: 'Electronics',
        brand: 'Apple',
        description: 'iPhone 15 Pro features a strong and lightweight design made from aerospace-grade titanium — with a textured matte-glass back. It also features the Ceramic Shield front that\'s tougher than any smartphone glass. And it\'s splash, water, and dust resistant. The A17 Pro chip delivers a massive leap in graphics performance.',
        price: 999,
        originalPrice: 1199,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&h=500&fit=crop'],
        rating: 4.6,
        ratingCount: 12453,
        badge: '16% OFF',
        stock: 150,
        sellerId: 'system',
        sellerName: 'TechWorld Official',
        specs: { 'Display': '6.1" Super Retina XDR OLED', 'Processor': 'A17 Pro Bionic', 'Camera': '48 MP Main + 12 MP Ultra Wide', 'Battery': '3274 mAh', 'Storage': '256 GB', 'OS': 'iOS 17' }
      },
      {
        id: 'samsung-galaxy-s24',
        name: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB)',
        category: 'Electronics',
        brand: 'Samsung',
        description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with the most powerful Snapdragon processor, a titanium exterior, and a 200MP camera. It\'s the most powerful Galaxy device yet, powered by Galaxy AI for an intelligent experience.',
        price: 899,
        originalPrice: 1099,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop'],
        rating: 4.5,
        ratingCount: 8923,
        badge: '18% OFF',
        stock: 200,
        sellerId: 'system',
        sellerName: 'Samsung Authorized',
        specs: { 'Display': '6.8" Dynamic AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'Camera': '200 MP + 12 MP + 50 MP + 10 MP', 'Battery': '5000 mAh', 'RAM': '12 GB' }
      },
      {
        id: 'sony-wh1000xm5',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        category: 'Electronics',
        brand: 'Sony',
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback).',
        price: 299,
        originalPrice: 399,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
        rating: 4.8,
        ratingCount: 15632,
        badge: 'BESTSELLER',
        stock: 500,
        sellerId: 'system',
        sellerName: 'Audio Paradise',
        specs: { 'Driver': '30mm', 'Noise Cancellation': 'Industry Leading ANC', 'Battery': '30 Hours', 'Bluetooth': '5.2', 'Weight': '250g', 'Codec': 'LDAC, AAC, SBC' }
      },
      {
        id: 'nike-air-max',
        name: 'Nike Air Max 270 React Running Shoes',
        category: 'Fashion',
        brand: 'Nike',
        description: 'The Nike Air Max 270 React combines two of Nike\'s best technologies to create a shoe that\'s incredibly soft and extraordinarily cushioned. The Nike React foam delivers a lightweight, smooth, responsive ride, while the Max Air 270 unit delivers unrivaled, all-day comfort.',
        price: 149,
        originalPrice: 190,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'],
        rating: 4.4,
        ratingCount: 6321,
        badge: '21% OFF',
        stock: 300,
        sellerId: 'system',
        sellerName: 'SportZone',
        specs: { 'Upper': 'Mesh and Synthetic', 'Midsole': 'React Foam + Air Max 270', 'Outsole': 'Rubber', 'Closure': 'Lace-up', 'Weight': '310g' }
      },
      {
        id: 'levis-511-jeans',
        name: 'Levi\'s 511 Slim Fit Men\'s Jeans - Dark Indigo',
        category: 'Fashion',
        brand: 'Levi\'s',
        description: 'The 511 Slim Fit Jeans are a modern slim with room to move. These jeans sit below the waist with a slim fit from hip to ankle. Made with premium denim that holds its shape and color wash after wash.',
        price: 59,
        originalPrice: 79,
        image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&h=500&fit=crop'],
        rating: 4.3,
        ratingCount: 9812,
        stock: 800,
        sellerId: 'system',
        sellerName: 'Fashion Hub',
        specs: { 'Fit': 'Slim', 'Rise': 'Mid Rise', 'Material': '99% Cotton, 1% Elastane', 'Wash': 'Dark Indigo', 'Closure': 'Zip Fly' }
      },
      {
        id: 'instant-pot-duo',
        name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
        category: 'Home & Kitchen',
        brand: 'Instant Pot',
        description: 'The Instant Pot Duo is the #1 selling multi-cooker, a smart electric pressure cooker that speeds up cooking by 2-6x using up to 70% less energy and produces nutritious healthy food in a convenient and consistent fashion.',
        price: 79,
        originalPrice: 99,
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop'],
        rating: 4.7,
        ratingCount: 23456,
        badge: 'BESTSELLER',
        stock: 1200,
        sellerId: 'system',
        sellerName: 'HomeEssentials',
        specs: { 'Capacity': '6 Quart', 'Functions': 'Pressure Cook, Slow Cook, Rice, Steam, Sauté, Yogurt, Warm', 'Power': '1000W', 'Material': 'Stainless Steel' }
      },
      {
        id: 'yoga-mat-premium',
        name: 'Premium Non-Slip Yoga Mat with Alignment Lines',
        category: 'Sports',
        brand: 'ProFit',
        description: 'Extra thick 6mm TPE yoga mat with body alignment system. Eco-friendly, non-toxic material. Double-sided non-slip surfaces for stability. Includes carrying strap and bag.',
        price: 34,
        originalPrice: 49,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'],
        rating: 4.5,
        ratingCount: 4521,
        badge: '30% OFF',
        stock: 2000,
        sellerId: 'system',
        sellerName: 'FitLife Store',
        specs: { 'Material': 'TPE (Thermoplastic Elastomer)', 'Thickness': '6mm', 'Dimensions': '72" x 24"', 'Weight': '2.5 lbs', 'Features': 'Alignment Lines, Double-sided Non-slip' }
      },
      {
        id: 'kindle-paperwhite',
        name: 'Kindle Paperwhite (16 GB) – Agave Green',
        category: 'Electronics',
        brand: 'Amazon',
        description: 'Kindle Paperwhite has a 6.8" display with adjustable warm light, thin borders, and a sleek design that\'s IPX8 rated waterproof so you can read in the bath or by the pool. Battery lasts up to 10 weeks.',
        price: 139,
        originalPrice: 149,
        image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop'],
        rating: 4.7,
        ratingCount: 18234,
        stock: 400,
        sellerId: 'system',
        sellerName: 'BookNook Digital',
        specs: { 'Display': '6.8" Glare-free 300 ppi', 'Storage': '16 GB', 'Battery': 'Up to 10 weeks', 'Waterproof': 'IPX8', 'Connectivity': 'WiFi', 'Light': 'Adjustable warm light' }
      },
      {
        id: 'ceramic-cookware-set',
        name: 'GreenPan Valencia Pro 11-Piece Ceramic Cookware Set',
        category: 'Home & Kitchen',
        brand: 'GreenPan',
        description: 'Hard anodized aluminum body with Thermolon Minerals Pro ceramic nonstick coating. Oven safe to 600°F. Metal utensil safe. PFAS, PFOA, lead, and cadmium free.',
        price: 249,
        originalPrice: 349,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop'],
        rating: 4.6,
        ratingCount: 3456,
        badge: '28% OFF',
        stock: 150,
        sellerId: 'system',
        sellerName: 'HomeEssentials',
        specs: { 'Pieces': '11', 'Material': 'Hard Anodized Aluminum + Ceramic', 'Oven Safe': 'Up to 600°F', 'Dishwasher Safe': 'Yes', 'Coating': 'Thermolon Minerals Pro' }
      },
      {
        id: 'adidas-ultraboost',
        name: 'Adidas Ultraboost Light Running Shoes',
        category: 'Sports',
        brand: 'Adidas',
        description: 'The lightest Ultraboost ever. Made with 30% less carbon footprint compared to previous versions. BOOST midsole returns energy to your stride, while the Continental rubber outsole provides superior grip.',
        price: 189,
        originalPrice: 220,
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop'],
        rating: 4.5,
        ratingCount: 7654,
        badge: '14% OFF',
        stock: 250,
        sellerId: 'system',
        sellerName: 'SportZone',
        specs: { 'Midsole': 'Light BOOST', 'Upper': 'Primeknit+', 'Outsole': 'Continental Rubber', 'Drop': '10mm', 'Weight': '280g' }
      },
      {
        id: 'loreal-serum',
        name: 'L\'Oreal Paris Revitalift Hyaluronic Acid Serum',
        category: 'Beauty',
        brand: 'L\'Oreal Paris',
        description: '1.5% Pure Hyaluronic Acid Serum for intense hydration and anti-aging. Visibly replumps skin and reduces wrinkles in 2 weeks. Lightweight, fast-absorbing formula suitable for all skin types.',
        price: 24,
        originalPrice: 32,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop'],
        rating: 4.4,
        ratingCount: 11234,
        badge: '25% OFF',
        stock: 3000,
        sellerId: 'system',
        sellerName: 'Beauty Bazaar',
        specs: { 'Volume': '30ml', 'Key Ingredient': '1.5% Pure Hyaluronic Acid', 'Skin Type': 'All Skin Types', 'Usage': 'Apply morning and night', 'Texture': 'Lightweight Serum' }
      },
      {
        id: 'mechanical-keyboard',
        name: 'Keychron K8 Pro Wireless Mechanical Keyboard',
        category: 'Electronics',
        brand: 'Keychron',
        description: 'QMK/VIA compatible wireless mechanical keyboard with hot-swappable switches. Features Bluetooth 5.1 and USB-C connectivity, 4000mAh battery, RGB backlight, and aluminum frame construction.',
        price: 109,
        originalPrice: 129,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&h=500&fit=crop'],
        rating: 4.7,
        ratingCount: 5678,
        badge: '15% OFF',
        stock: 180,
        sellerId: 'system',
        sellerName: 'TechWorld Official',
        specs: { 'Layout': 'Tenkeyless (TKL)', 'Switches': 'Gateron G Pro (Hot-swappable)', 'Connectivity': 'Bluetooth 5.1 + USB-C', 'Battery': '4000mAh', 'Backlight': 'RGB', 'Frame': 'Aluminum' }
      },
    ];

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO products (
        id, name, category, brand, description, price, originalPrice, image, images, rating, ratingCount, badge, stock, sellerId, sellerName, specs, isOutOfStock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of productsToSeed) {
      stmt.run(
        p.id, p.name, p.category, p.brand, p.description, p.price,
        p.originalPrice || null, p.image, JSON.stringify(p.images),
        p.rating, p.ratingCount, p.badge || null, p.stock,
        p.sellerId, p.sellerName, JSON.stringify(p.specs),
        p.isOutOfStock ? 1 : 0
      );
    }
    stmt.finalize();
  }

  private mapRow(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      category: row.category as any,
      brand: row.brand || '',
      description: row.description,
      price: row.price,
      originalPrice: row.originalPrice,
      image: row.image,
      images: row.images ? JSON.parse(row.images) : [row.image],
      rating: row.rating,
      ratingCount: row.ratingCount,
      badge: row.badge,
      stock: row.stock || 0,
      sellerId: row.sellerId || 'system',
      sellerName: row.sellerName || 'CloudCommerce',
      specs: row.specs ? JSON.parse(row.specs) : {},
      isOutOfStock: row.isOutOfStock === 1,
    };
  }

  public findAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM products', [], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => this.mapRow(row)));
      });
    });
  }

  public findById(id: string): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(this.mapRow(row));
      });
    });
  }

  public findBySellerId(sellerId: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM products WHERE sellerId = ?', [sellerId], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => this.mapRow(row)));
      });
    });
  }

  public findByCategory(category: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM products WHERE category = ?', [category], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => this.mapRow(row)));
      });
    });
  }

  public create(product: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO products (id, name, category, brand, description, price, originalPrice, image, images, rating, ratingCount, badge, stock, sellerId, sellerName, specs, isOutOfStock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.category, product.brand, product.description, product.price, product.originalPrice || null, product.image, JSON.stringify(product.images), product.rating || 0, product.ratingCount || 0, product.badge || null, product.stock, product.sellerId, product.sellerName, JSON.stringify(product.specs), product.isOutOfStock ? 1 : 0],
        (err) => {
          if (err) return reject(err);
          resolve(product);
        }
      );
    });
  }

  public update(id: string, fields: Partial<Product>): Promise<Product | null> {
    const setClauses: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, (v: any) => any> = {
      name: v => v, category: v => v, brand: v => v, description: v => v,
      price: v => v, originalPrice: v => v, image: v => v,
      images: v => JSON.stringify(v), badge: v => v, stock: v => v,
      specs: v => JSON.stringify(v), isOutOfStock: v => v ? 1 : 0,
    };

    for (const [key, transform] of Object.entries(fieldMap)) {
      if ((fields as any)[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(transform((fields as any)[key]));
      }
    }

    if (setClauses.length === 0) return this.findById(id);
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) return reject(err);
        this.findById(id).then(resolve).catch(reject);
      });
    });
  }

  public delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  public findReviewsByProductId(productId: string): Promise<Review[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM reviews WHERE productId = ?', [productId], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => ({
          id: row.id, productId: row.productId, author: row.author,
          rating: row.rating, date: row.date, title: row.title,
          body: row.body, verified: row.verified === 1
        })));
      });
    });
  }

  public createReview(review: Review): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO reviews (id, productId, author, rating, date, title, body, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [review.id, review.productId, review.author, review.rating, review.date, review.title, review.body, review.verified ? 1 : 0],
        (err) => {
          if (err) return reject(err);
          resolve(review);
        }
      );
    });
  }
}
