import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const API_KEY = process.env.GOOGLE_GENAI_API_KEY || '';

/**
 * Service to handle all interactions with Gemini 3 models.
 * Includes built-in resilience, retries, and model orchestration.
 */
export class GeminiService {
  private static genAI = new GoogleGenerativeAI(API_KEY);

  /**
   * Models available in the Gemini 3 ecosystem.
   * - Flash: Optimized for speed and high-volume file summaries.
   * - Pro/Ultra: Optimized for complex architectural reasoning.
   */
  private static MODELS = {
    FLASH: 'gemini-3.1-flash-lite-preview', 
    PRO: 'gemini-3-flash-preview',
  };

  /**
   * Executes a prompt with exponential backoff and error handling.
   * @param prompt The string prompt to send to the AI
   * @param usePro Whether to use the heavy-duty 'Pro' model (defaults to false/Flash)
   */
  static async generateText(prompt: string, usePro = false): Promise<string> {
    if (!API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is missing from environment variables.');
    }

    const modelName = usePro ? this.MODELS.PRO : this.MODELS.FLASH;
    const model = this.genAI.getGenerativeModel({ model: modelName });

    return this.withRetry(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error('Gemini returned an empty response.');
      return text;
    });
  }

  /**
   * Internal wrapper to handle API resilience.
   * Implements a simple retry mechanism for 429 (Rate Limit) or 500 errors.
   */
  private static async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: unknown;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        const isRateLimit = errorMessage.includes('429');
        const delay = isRateLimit ? Math.pow(2, i) * 2000 : 1000;

        if (i < retries - 1) {
          logger.warn(`Gemini API attempt ${i + 1} failed. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    logger.error(`Gemini AI Service failed after ${retries} attempts: ${finalErrorMessage}`);
    throw lastError;
  }
}