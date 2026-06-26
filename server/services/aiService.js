import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiConfigError,
  AiRateLimitError,
  AiServiceError,
} from '../utils/aiErrors.js';

const PLACEHOLDER_KEY = '<your-gemini-api-key>';

function getApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === PLACEHOLDER_KEY) {
    return null;
  }
  return key;
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

export function ensureGeminiConfigured() {
  if (!isGeminiConfigured()) {
    throw new AiConfigError();
  }
}

let client = null;

function getClient() {
  ensureGeminiConfigured();
  if (!client) {
    client = new GoogleGenerativeAI(getApiKey());
  }
  return client;
}

function isRateLimitError(err) {
  const status = err?.status ?? err?.statusCode;
  if (status === 429) return true;
  const message = err?.message?.toLowerCase() ?? '';
  return message.includes('429') || message.includes('rate limit');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(prompt, { json = true } = {}) {
  ensureGeminiConfigured();

  const modelName = process.env.AI_MODEL || 'gemini-2.0-flash';
  const generationConfig = json ? { responseMimeType: 'application/json' } : {};
  const model = getClient().getGenerativeModel({ model: modelName, generationConfig });

  async function attempt(isRetry = false) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!json) {
        return text;
      }

      try {
        return JSON.parse(text);
      } catch {
        throw new AiServiceError('AI returned an invalid response');
      }
    } catch (err) {
      if (err instanceof AiConfigError || err instanceof AiServiceError || err instanceof AiRateLimitError) {
        throw err;
      }

      if (isRateLimitError(err) && !isRetry) {
        await sleep(1000);
        return attempt(true);
      }

      if (isRateLimitError(err)) {
        throw new AiRateLimitError();
      }

      throw new AiServiceError();
    }
  }

  return attempt();
}
