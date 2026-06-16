import { Router, Request, Response } from 'express';
import { SQLiteCartRepository } from '../../../infrastructure/database/CartRepository.js';
import { CartItem } from '../../../domain/entities/Cart.js';
import { z } from 'zod';

const router = Router();
const cartRepository = new SQLiteCartRepository();

const getUserId = (req: Request): string => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    throw new Error('Unauthorized: Missing user identity context.');
  }
  return userId;
};

// Zod Validator schemas
const customConfigSchema = z.object({
  vCPUs: z.number(),
  ramGB: z.number(),
  storageGB: z.number(),
  region: z.string(),
  tier: z.enum(['Basic', 'Standard', 'Premium']),
  monthlyRate: z.number(),
});

const addItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productPrice: z.number(),
  productImage: z.string(),
  isAzureResource: z.boolean(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  selectedColor: z.string().optional(),
  customConfig: customConfigSchema.optional(),
});

// GET user cart
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const cart = await cartRepository.findByUserId(userId);
    res.json(cart);
  } catch (err: any) {
    console.error('[Get Cart Error]:', err);
    res.status(err.message.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// POST Add item
router.post('/items', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const itemData = addItemSchema.parse(req.body);
    const cart = await cartRepository.findByUserId(userId);

    // Build item ID based on uniqueness of attributes (composite)
    let itemId = itemData.productId;
    if (itemData.selectedColor) {
      itemId += `-${itemData.selectedColor}`;
    }
    if (itemData.customConfig) {
      // Create hash representation of custom config for uniqueness
      const conf = itemData.customConfig;
      itemId += `-${conf.region}-${conf.vCPUs}-${conf.ramGB}-${conf.tier}`;
    }

    const existingItemIndex = cart.items.findIndex(i => i.id === itemId);
    if (existingItemIndex > -1) {
      // Increment quantity
      cart.items[existingItemIndex].quantity += itemData.quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        ...itemData,
      };
      cart.items.push(newItem);
    }

    await cartRepository.save(cart);
    res.json(cart);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Add Cart Item Error]:', err);
    res.status(err.message?.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// PUT Update item quantity
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const itemId = req.params.id;
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);

    const cart = await cartRepository.findByUserId(userId);
    const itemIndex = cart.items.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cartRepository.save(cart);
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Cart item not found.' });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Update Cart Item Error]:', err);
    res.status(err.message?.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// DELETE single item
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const itemId = req.params.id;

    const cart = await cartRepository.findByUserId(userId);
    const filteredItems = cart.items.filter(i => i.id !== itemId);

    cart.items = filteredItems;
    await cartRepository.save(cart);
    res.json(cart);
  } catch (err: any) {
    console.error('[Delete Cart Item Error]:', err);
    res.status(err.message?.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// DELETE clear cart
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    await cartRepository.clear(userId);
    res.json({ userId, items: [] });
  } catch (err: any) {
    console.error('[Clear Cart Error]:', err);
    res.status(err.message?.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

export default router;
