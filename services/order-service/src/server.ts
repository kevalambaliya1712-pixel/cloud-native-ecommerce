import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRouter from './interfaces/http/routes/order.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Health check (must be before orderRouter to avoid /:id catch-all)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Order Service', timestamp: new Date() });
});

// Main routes
app.use('/', orderRouter);

app.listen(PORT, () => {
  console.log(`[Order Service] Running on port ${PORT}`);
});
