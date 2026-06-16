import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRouter from './interfaces/http/routes/product.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Main routes
app.use('/', productRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Product Service', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[Product Service] Running on port ${PORT}`);
});
