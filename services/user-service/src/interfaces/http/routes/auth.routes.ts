import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { SQLiteUserRepository } from '../../../infrastructure/database/UserRepository.js';

const router = Router();
const userRepository = new SQLiteUserRepository();

const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Schema validations
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['customer', 'seller']).optional().default('customer'),
  storeName: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
  phone: z.string().optional(),
});

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, storeName, phone } = registerSchema.parse(req.body);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    const user = await userRepository.create({
      id: userId,
      email,
      passwordHash,
      name,
      role: role || 'customer',
      storeName: role === 'seller' ? storeName : undefined,
      phone,
      isVerified: false,
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[User Auth Register Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[User Auth Login Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Profile - checks header context forwarded from API Gateway
router.get('/profile', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user identity context.' });
  }

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[User Profile Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update Profile
router.put('/profile', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user identity context.' });
  }

  try {
    const fields = updateProfileSchema.parse(req.body);
    const user = await userRepository.update(userId, fields);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Update Profile Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET all sellers (public)
router.get('/sellers', async (req: Request, res: Response) => {
  try {
    const sellers = await userRepository.findAllSellers();
    res.json(sellers.map(s => ({
      id: s.id,
      name: s.name,
      storeName: s.storeName,
      storeDescription: s.storeDescription,
      isVerified: s.isVerified,
      createdAt: s.createdAt,
    })));
  } catch (err) {
    console.error('[Get Sellers Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET seller by ID (public)
router.get('/sellers/:id', async (req: Request, res: Response) => {
  try {
    const seller = await userRepository.findById(req.params.id);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ error: 'Seller not found.' });
    }
    res.json({
      id: seller.id,
      name: seller.name,
      storeName: seller.storeName,
      storeDescription: seller.storeDescription,
      isVerified: seller.isVerified,
      createdAt: seller.createdAt,
    });
  } catch (err) {
    console.error('[Get Seller Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
