import { ensureGeminiConfigured } from '../services/aiService.js';

export async function suggestCategory(req, res) {
  ensureGeminiConfigured();

  // Stub — full implementation in Step 21
  res.json({ suggestion: null });
}

export async function spendingInsights(req, res) {
  ensureGeminiConfigured();

  // Stub — full implementation in Step 24
  res.json({ insights: null, message: 'Spending insights not yet implemented' });
}
