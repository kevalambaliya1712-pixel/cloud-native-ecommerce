import { Router, Request, Response } from 'express';
import { SQLiteProductRepository } from '../../../infrastructure/database/ProductRepository.js';
import { z } from 'zod';

const router = Router();
const productRepository = new SQLiteProductRepository();

const reviewSchema = z.object({
  author: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys', 'Grocery']),
  brand: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().min(0),
  badge: z.string().optional(),
  specs: z.record(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial();

// GET all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.findAll();
    res.json(products);
  } catch (err) {
    console.error('[Get Products Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    console.error('[Get Product By Id Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET products by seller
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.findBySellerId(req.params.sellerId);
    res.json(products);
  } catch (err) {
    console.error('[Get Seller Products Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET reviews for a product
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await productRepository.findReviewsByProductId(req.params.id);
    res.json(reviews);
  } catch (err) {
    console.error('[Get Reviews Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST review
router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { author, rating, title, body } = reviewSchema.parse(req.body);
    const reviewId = 'rev_' + Math.random().toString(36).substr(2, 9);
    
    const isUserVerified = !!req.headers['x-user-id']; // If they are logged in

    const review = await productRepository.createReview({
      id: reviewId,
      productId: req.params.id,
      author,
      rating,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      title,
      body,
      verified: isUserVerified
    });

    res.status(201).json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Create Review Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST create product (seller only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!userId || userRole !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can create products.' });
    }

    const data = createProductSchema.parse(req.body);
    const productId = 'prod_' + Math.random().toString(36).substr(2, 9);

    const product = await productRepository.create({
      id: productId,
      ...data,
      images: data.images || [data.image],
      rating: 0,
      ratingCount: 0,
      sellerId: userId,
      sellerName: req.body.sellerName || userEmail.split('@')[0],
      specs: data.specs || {},
      isOutOfStock: data.stock === 0,
    });

    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Create Product Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT update product (seller only, must own the product)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!userId || userRole !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can update products.' });
    }

    const existing = await productRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    if (existing.sellerId !== userId) {
      return res.status(403).json({ error: 'You can only update your own products.' });
    }

    const data = updateProductSchema.parse(req.body);
    const updated = await productRepository.update(req.params.id, data);
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Update Product Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE product (seller only, must own the product)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!userId || userRole !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can delete products.' });
    }

    const existing = await productRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    if (existing.sellerId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own products.' });
    }

    await productRepository.delete(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('[Delete Product Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
