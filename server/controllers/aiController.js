import Category from '../models/Category.js';
import {
  callGemini,
  ensureGeminiConfigured,
  isGeminiConfigured,
} from '../services/aiService.js';
import { fetchAnalyticsBundle } from '../utils/analyticsQueries.js';
import { buildCompactAnalyticsPayload } from '../utils/analyticsPayload.js';
import { buildCategorySuggestionPrompt, buildSpendingInsightsPrompt } from '../utils/aiPrompts.js';
import { AiServiceError } from '../utils/aiErrors.js';
import { suggestCategoryByKeywords } from '../utils/categoryKeywords.js';
import { getCachedInsights, setCachedInsights } from '../utils/insightsCache.js';

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
  const { startDate, endDate, dateRangeLabel, forceRefresh = false } = req.body;
  const userId = req.user._id;
  const query = { startDate, endDate };

  const { summary, byCategory, overTime } = await fetchAnalyticsBundle(userId, query);

  if (summary.transactionCount === 0) {
    return res.json({
      insights: null,
      message: 'No transactions in this period. Add expenses to generate insights.',
    });
  }

  if (!forceRefresh) {
    const cached = getCachedInsights(userId, startDate, endDate);
    if (cached) {
      return res.json({
        insights: {
          ...cached,
          cached: true,
        },
      });
    }
  }

  ensureGeminiConfigured();

  const payload = buildCompactAnalyticsPayload(
    summary,
    byCategory,
    overTime,
    dateRangeLabel
  );
  const prompt = buildSpendingInsightsPrompt(JSON.stringify(payload));
  const result = await callGemini(prompt);

  const bullets = Array.isArray(result?.bullets)
    ? result.bullets.filter((bullet) => typeof bullet === 'string' && bullet.trim())
    : [];
  const tip = typeof result?.tip === 'string' ? result.tip.trim() : '';

  if (bullets.length === 0 && !tip) {
    throw new AiServiceError();
  }

  const generatedAt = new Date().toISOString();
  const insights = {
    bullets,
    tip,
    generatedAt,
    cached: false,
  };

  setCachedInsights(userId, startDate, endDate, {
    bullets,
    tip,
    generatedAt,
  });

  res.json({ insights });
}
