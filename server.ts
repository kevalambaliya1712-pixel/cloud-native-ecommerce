/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // lazy initialize or check Gemini API safe configuration
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not defined in the Secrets panel.');
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

  // API Route: Architectural consultant endpoint using server-side Gemini
  app.post('/api/gemini/optimize', async (req, res) => {
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
          error: 'Parser Error: The AI model model did not return formatted JSON. Please try framing your architecture request differently.',
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

  // Integrate Vite Dev Server in Development, static assets in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production built files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CloudCommerce Backend] Server running at http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((error) => {
  console.error('[CloudCommerce Backend Startup Failure]:', error);
  process.exit(1);
});
