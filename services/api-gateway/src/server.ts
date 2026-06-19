import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { services } from './config/services.js';
import { authenticateJWT, optionalAuthenticateJWT, requireSellerRole } from './interfaces/middleware/auth.middleware.js';
import { globalRateLimiter } from './interfaces/middleware/rate-limit.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-role'],
}));

// Gateway-level health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'API Gateway', timestamp: new Date() });
});

// Rate Limiting
app.use('/api/', globalRateLimiter);

// Setup proxies
const createGatewayProxy = (target: string, requiresAuth = false, optionalAuth = false) => {
  const options: Options = {
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix when sending to downstream services
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Forwarded headers are already set by auth middleware if token was verified
      }
    }
  };

  const middleware = createProxyMiddleware(options);

  if (requiresAuth) {
    return [authenticateJWT, middleware];
  } else if (optionalAuth) {
    return [optionalAuthenticateJWT, middleware];
  }
  return [middleware];
};

// Route user/auth requests
app.use('/api/auth', ...createGatewayProxy(services.userService));

// Route seller listing (public)
app.use('/api/sellers', ...createGatewayProxy(services.userService, false, true));

// Route product requests (optional auth for review authorship)
app.use('/api/products', ...createGatewayProxy(services.productService, false, true));

// Route cart requests (requires auth)
app.use('/api/cart', ...createGatewayProxy(services.cartService, true));

// Route order requests (requires auth)
app.use('/api/orders', ...createGatewayProxy(services.orderService, true));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Gateway Error]:', err);
  res.status(500).json({ error: 'Gateway Error: An unexpected error occurred forwarding your request.' });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
  console.log(`- Downstream User Service: ${services.userService}`);
  console.log(`- Downstream Product Service: ${services.productService}`);
  console.log(`- Downstream Cart Service: ${services.cartService}`);
  console.log(`- Downstream Order Service: ${services.orderService}`);
});
