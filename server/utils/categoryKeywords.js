const KEYWORD_MAP = [
  {
    keywords: ['uber', 'lyft', 'gas', 'parking', 'metro', 'transit'],
    names: ['transport', 'transportation', 'travel', 'auto'],
  },
  {
    keywords: ['grocery', 'whole foods', 'trader joe', 'walmart', 'costco'],
    names: ['groceries', 'food'],
  },
  {
    keywords: ['restaurant', 'lunch', 'dinner', 'coffee', 'starbucks', 'doordash'],
    names: ['dining', 'food', 'restaurants'],
  },
  {
    keywords: ['netflix', 'spotify', 'subscription'],
    names: ['entertainment', 'subscriptions'],
  },
  {
    keywords: ['rent', 'mortgage', 'utilities', 'electric'],
    names: ['housing', 'bills', 'utilities'],
  },
];

export function suggestCategoryByKeywords(description, categories) {
  const lower = description.toLowerCase();

  for (const entry of KEYWORD_MAP) {
    const keywordHit = entry.keywords.some((keyword) => lower.includes(keyword));
    if (!keywordHit) continue;

    const category = categories.find((c) =>
      entry.names.some((name) => c.name.toLowerCase().includes(name))
    );

    if (category) {
      return {
        categoryId: category._id.toString(),
        categoryName: category.name,
        confidence: 'medium',
        source: 'keyword',
      };
    }
  }

  return null;
}
