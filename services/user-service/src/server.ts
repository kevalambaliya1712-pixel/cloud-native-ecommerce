import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './interfaces/http/routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main Auth endpoints
app.use('/', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'User Service', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[User Service] Running on port ${PORT}`);
});
