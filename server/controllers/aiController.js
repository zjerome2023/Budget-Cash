import Category from '../models/Category.js';
import { callGemini, ensureGeminiConfigured, isGeminiConfigured } from '../services/aiService.js';
import { buildCategorySuggestionPrompt } from '../utils/aiPrompts.js';
import { suggestCategoryByKeywords } from '../utils/categoryKeywords.js';

const VALID_CONFIDENCE = new Set(['high', 'medium', 'low']);

function buildSuggestion(category, confidence, source) {
  return {
    categoryId: category._id.toString(),
    categoryName: category.name,
    confidence,
    source,
  };
}

function validateAiSuggestion(aiResult, categories) {
  if (!aiResult?.categoryId) {
    return null;
  }

  const categoryId = String(aiResult.categoryId);
  const category = categories.find((c) => c._id.toString() === categoryId);
  if (!category) {
    return null;
  }

  const confidence = VALID_CONFIDENCE.has(aiResult.confidence)
    ? aiResult.confidence
    : 'medium';

  return buildSuggestion(category, confidence, 'ai');
}

export async function suggestCategory(req, res) {
  const { description } = req.body;
  const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

  if (categories.length === 0) {
    return res.json({ suggestion: null });
  }

  let suggestion = null;

  if (isGeminiConfigured()) {
    try {
      const prompt = buildCategorySuggestionPrompt(description, categories);
      const aiResult = await callGemini(prompt);
      suggestion = validateAiSuggestion(aiResult, categories);
    } catch {
      // Fall through to keyword matching.
    }
  }

  if (!suggestion) {
    suggestion = suggestCategoryByKeywords(description, categories);
  }

  res.json({ suggestion });
}

export async function spendingInsights(req, res) {
  ensureGeminiConfigured();

  // Stub — full implementation in Step 24
  res.json({ insights: null, message: 'Spending insights not yet implemented' });
}
