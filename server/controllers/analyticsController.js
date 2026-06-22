import Transaction from '../models/Transaction.js';
import { buildDateMatch, getPeriodExpression } from '../utils/analytics.js';

export async function getSummary(req, res) {
  try {
    const match = buildDateMatch(req.user._id, req.query);

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

    res.json({
      summary: {
        totalSpend: stats?.totalSpend ?? 0,
        transactionCount: stats?.transactionCount ?? 0,
        topCategory: topCategory ?? null,
      },
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ message: 'Failed to get analytics summary' });
  }
}

export async function getByCategory(req, res) {
  try {
    const match = buildDateMatch(req.user._id, req.query);

    const byCategory = await Transaction.aggregate([
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

    res.json({ byCategory });
  } catch (error) {
    console.error('Analytics by-category error:', error);
    res.status(500).json({ message: 'Failed to get analytics by category' });
  }
}

export async function getOverTime(req, res) {
  try {
    const match = buildDateMatch(req.user._id, req.query);
    const groupBy = req.query.groupBy || 'day';
    const periodExpr = getPeriodExpression(groupBy);

    const overTime = await Transaction.aggregate([
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

    res.json({ overTime });
  } catch (error) {
    console.error('Analytics over-time error:', error);
    res.status(500).json({ message: 'Failed to get analytics over time' });
  }
}
