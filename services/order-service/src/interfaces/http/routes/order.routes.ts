import { Router, Request, Response } from 'express';
import { SQLiteOrderRepository } from '../../../infrastructure/database/OrderRepository.js';
import { Order, OrderItem } from '../../../domain/entities/Order.js';
import { z } from 'zod';

const router = Router();
const orderRepository = new SQLiteOrderRepository();

const getUserId = (req: Request): string => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    throw new Error('Unauthorized: Missing user identity context.');
  }
  return userId;
};

// Validator schema for placing order
const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productPrice: z.number(),
  productImage: z.string(),
  brand: z.string().optional().default(''),
  quantity: z.number().int().positive(),
  sellerId: z.string().optional().default(''),
  sellerName: z.string().optional().default(''),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
  email: z.string().email(),
  shippingName: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingZip: z.string().min(1),
  paymentMethod: z.string().min(1),
});

// GET all orders for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const orders = await orderRepository.findByUserId(userId);
    res.json(orders);
  } catch (err: any) {
    console.error('[Get Orders Error]:', err);
    res.status(err.message.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// GET all orders for a seller's products
router.get('/seller', async (req: Request, res: Response) => {
  try {
    const sellerId = getUserId(req);
    const orders = await orderRepository.findBySellerId(sellerId);
    res.json(orders);
  } catch (err: any) {
    console.error('[Get Seller Orders Error]:', err);
    res.status(err.message.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// GET order details by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const order = await orderRepository.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this order.' });
    }
    res.json(order);
  } catch (err: any) {
    console.error('[Get Order By Id Error]:', err);
    res.status(err.message.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

// PUT update order status (for sellers or admin)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await orderRepository.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err: any) {
    console.error('[Update Order Status Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST place order
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const orderData = placeOrderSchema.parse(req.body);

    const orderId = 'order_' + Math.random().toString(36).substr(2, 9);

    const order: Order = {
      id: orderId,
      userId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      discount: orderData.discount,
      total: orderData.total,
      status: 'confirmed',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      email: orderData.email,
      shippingName: orderData.shippingName,
      shippingAddress: orderData.shippingAddress,
      shippingCity: orderData.shippingCity,
      shippingZip: orderData.shippingZip,
      paymentMethod: orderData.paymentMethod,
    };

    const savedOrder = await orderRepository.create(order);

    // Call Notification Service asynchronously if available
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';
    try {
      fetch(`${notificationServiceUrl}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: savedOrder.email,
          subject: `Order Confirmation - ${savedOrder.id}`,
          message: `Thank you for your order of $${savedOrder.total.toFixed(2)}. Your order has been confirmed!`,
          orderDetails: savedOrder
        })
      }).catch(e => console.log('Notification Service unreachable, skipping email dispatch.'));
    } catch (e) {
      // ignore
    }

    res.status(201).json(savedOrder);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Place Order Error]:', err);
    res.status(err.message?.includes('Unauthorized') ? 401 : 500).json({ error: err.message });
  }
});

export default router;
