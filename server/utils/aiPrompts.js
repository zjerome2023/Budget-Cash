export function buildCategorySuggestionPrompt(description, categories) {
  const categoryList = categories
    .map((c) => `${c._id} → ${c.name}`)
    .join('\n');

  return `You are a budget app assistant. Given an expense description and a list of the user's categories, pick the single best matching category.

Categories (id → name):
${categoryList}

Expense description: "${description}"

Respond with JSON only:
{
  "categoryId": "<exact id from list or null>",
  "confidence": "high" | "medium" | "low",
  "reasoning": "<one short sentence>"
}

Rules:
- categoryId MUST be one of the provided ids, or null if no good match
- Do not invent categories
- Prefer the most specific match`;
}

export function buildSpendingInsightsPrompt(jsonPayload) {
  return `You are a friendly personal finance assistant. Analyze this spending data and provide helpful insights.

Data:
${jsonPayload}

Respond with JSON only:
{
  "bullets": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "tip": "<one specific, actionable savings tip>"
}

Rules:
- Provide 3 to 5 bullet insights
- Use dollar amounts from the data (format as $X.XX)
- Mention the top category and its percentage
- Note any spending spikes or patterns in daily totals
- Keep each bullet to one sentence
- Tip should be practical and specific to the data
- Do not invent transactions or categories not in the data
- Be encouraging, not judgmental`;
}
