import dotenv from 'dotenv';
dotenv.config();

export const services = {
  userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  cartService: process.env.CART_SERVICE_URL || 'http://localhost:3003',
  orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
};

export const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';
