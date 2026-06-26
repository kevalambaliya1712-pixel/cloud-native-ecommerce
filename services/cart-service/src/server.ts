import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cartRouter from './interfaces/http/routes/cart.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check (must be before cartRouter to avoid potential route conflicts)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Cart Service', timestamp: new Date() });
});

// Main routes
app.use('/', cartRouter);

app.listen(PORT, () => {
  console.log(`[Cart Service] Running on port ${PORT}`);
});
