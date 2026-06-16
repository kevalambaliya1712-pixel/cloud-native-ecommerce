import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

const notifySchema = z.object({
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  orderDetails: z.any().optional(),
});

app.post('/notify', (req, res) => {
  try {
    const { email, subject, message, orderDetails } = notifySchema.parse(req.body);

    console.log('\n========================================================================');
    console.log(`[Notification Service] OUTBOUND NOTIFICATION DISPATCHED`);
    console.log(`TO:      ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`MESSAGE: ${message}`);
    if (orderDetails) {
      console.log(`ORDER ID: ${orderDetails.id}`);
      console.log(`TOTAL:    $${orderDetails.total}`);
    }
    console.log('========================================================================\n');

    res.status(200).json({ success: true, message: 'Notification dispatched successfully.' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Notification Dispatch Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Notification Service', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[Notification Service] Running on port ${PORT}`);
});
