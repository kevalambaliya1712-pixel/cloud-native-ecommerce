import { Router, Request, Response } from 'express';
import { SQLiteProductRepository } from '../../../infrastructure/database/ProductRepository.js';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const router = Router();
const productRepository = new SQLiteProductRepository();

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const reviewSchema = z.object({
  author: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

// GET all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.findAll();
    res.json(products);
  } catch (err) {
    console.error('[Get Products Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    console.error('[Get Product By Id Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET reviews for a product
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await productRepository.findReviewsByProductId(req.params.id);
    res.json(reviews);
  } catch (err) {
    console.error('[Get Reviews Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST review
router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { author, rating, title, body } = reviewSchema.parse(req.body);
    const reviewId = 'rev_' + Math.random().toString(36).substr(2, 9);
    
    const isUserVerified = !!req.headers['x-user-id']; // If they are logged in

    const review = await productRepository.createReview({
      id: reviewId,
      productId: req.params.id,
      author,
      rating,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      title,
      body,
      verified: isUserVerified
    });

    res.status(201).json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error('[Create Review Error]:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST gemini architecture consultant optimization (copied and refined from server.ts)
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" parameter in request body.' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a certified Principal Azure Cloud Solutions Architect. Your role is to analyze user requirement prompts and output a perfectly configured, custom-tailored Azure Cloud Architecture.

You MUST respond strictly in raw JSON format matching this schema:
{
  "architectureSummary": "A concise, developer-friendly architectural summary, highlighting how this setup answers the requested workload requirements, with deployment suggestions.",
  "recommendedResources": [
    {
      "id": "azure-vm" or "azure-cosmos" or "azure-cognitive",
      "reasonText": "Why this specific resource is recommended for their requirements.",
      "config": {
        "vCPUs": number (select from: 2, 4, 8, 16, or 32),
        "ramGB": number (select from: 4, 8, 16, 32, 64, or 128),
        "storageGB": number (select from: 32, 64, 128, 256, 512, 1024, or 2048),
        "region": "eastus" or "westus3" or "westeurope" or "eastasia" or "southeastasia",
        "tier": "Basic" or "Standard" or "Premium",
        "monthlyRate": number (estimated monthly price, e.g., VM is $40-$500, Cosmos is $60-$800, Cognitive is $50-$600 depending on sizing)
      }
    }
  ]
}

Only suggest resources that match our direct storefront IDs ("azure-vm", "azure-cosmos", "azure-cognitive") to ensure they are instantly orderable and provisionable.
DO NOT wrap your response in markdown backticks like \`\`\`json. Return only the raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    try {
      const parsedJson = JSON.parse(responseText.trim());
      return res.json(parsedJson);
    } catch (jsonErr) {
      console.error('Failed to parse Gemini response as JSON. Raw output:', responseText);
      return res.status(500).json({
        error: 'Parser Error: The AI model did not return formatted JSON. Please try framing your architecture request differently.',
        rawOutput: responseText,
      });
    }
  } catch (err: any) {
    console.error('Error invoking Gemini model:', err);
    return res.status(500).json({
      error: err.message || 'An internal server error occurred while invoking Gemini.',
    });
  }
});

export default router;
