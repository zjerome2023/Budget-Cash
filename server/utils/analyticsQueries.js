import Transaction from '../models/Transaction.js';
import { buildDateMatch, getPeriodExpression } from './analytics.js';

export async function fetchSummary(userId, query) {
  const match = buildDateMatch(userId, query);

  const [stats] = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSpend: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const [topCategory] = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        category: '$category.name',
        total: 1,
        color: '$category.color',
      },
    },
  ]);

  return {
    totalSpend: stats?.totalSpend ?? 0,
    transactionCount: stats?.transactionCount ?? 0,
    topCategory: topCategory ?? null,
  };
}

export async function fetchByCategory(userId, query) {
  const match = buildDateMatch(userId, query);

  return Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        category: '$category.name',
        total: 1,
        color: '$category.color',
      },
    },
    { $sort: { total: -1 } },
  ]);
}

export async function fetchOverTime(userId, query) {
  const match = buildDateMatch(userId, query);
  const groupBy = query.groupBy || 'day';
  const periodExpr = getPeriodExpression(groupBy);

  return Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: periodExpr,
        total: { $sum: '$amount' },
      },
    },
    { $project: { _id: 0, period: '$_id', total: 1 } },
    { $sort: { period: 1 } },
  ]);
}

export async function fetchAnalyticsBundle(userId, query) {
  const [summary, byCategory, overTime] = await Promise.all([
    fetchSummary(userId, query),
    fetchByCategory(userId, query),
    fetchOverTime(userId, query),
  ]);

  return { summary, byCategory, overTime };
}
