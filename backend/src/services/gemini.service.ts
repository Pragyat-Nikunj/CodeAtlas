import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '../config/logger.js';

dotenv.config();

/**
 * Service to handle interactions with Gemini.
 * Uses native fetch for high-performance structured JSON generation.
 */
export class GeminiService {
  private static getApiKey(): string {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) {
      throw new Error(
        'GOOGLE_GENAI_API_KEY is missing from environment variables.'
      );
    }
    return key;
  }

  private static getBaseUrl(): string {
    const modelName = 'gemini-3.1-flash-lite-preview';
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.getApiKey()}`;
  }

  /**
   * Generates structured JSON output based on a prompt and a provided schema.
   * Forces Gemini to return valid data and validates it with Zod for runtime safety.
   * @param prompt - The instructions for the AI.
   * @param geminiSchema - The JSON schema format required by the Gemini API for generation.
   * @param zodSchema - The Zod schema used to validate and type-cast the response in the backend.
   */
  static async generateStructuredJson<T>(
    prompt: string,
    geminiSchema: object,
    zodSchema: z.ZodType<T>
  ): Promise<T> {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: geminiSchema,
      },
    };

    return this.withRetry(async () => {
      const response = await fetch(this.getBaseUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Gemini returned an empty response.');

      try {
        const rawJson = JSON.parse(text);

        return zodSchema.parse(rawJson);
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.error(
            `Gemini JSON validation failed: ${JSON.stringify(error.issues)}`
          );
          throw new Error(
            'Gemini output did not match the expected application schema.'
          );
        }

        logger.error(`Failed to parse Gemini JSON output: ${text}`);
        throw new Error('Gemini returned invalid JSON formatting.');
      }
    });
  }

  /**
   * Internal wrapper for API resilience with exponential backoff (1s, 2s, 4s, 8s, 16s).
   */
  private static async withRetry<T>(
    fn: () => Promise<T>,
    retries = 5
  ): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        const delay = Math.pow(2, i) * 1000;

        if (i < retries - 1) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.warn(
            `Gemini attempt ${i + 1} failed: ${errorMessage}. Retrying in ${delay}ms...`
          );
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }
    logger.error(`Gemini AI Service failed after ${retries} attempts.`);
    throw lastError;
  }
}
