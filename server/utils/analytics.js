import mongoose from 'mongoose';
import { buildDateRangeBounds } from './dates.js';

export function buildDateMatch(userId, query) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };

  const dateBounds = buildDateRangeBounds(query);
  if (dateBounds) {
    match.date = dateBounds;
  }

  return match;
}

export function getPeriodExpression(groupBy = 'day') {
  switch (groupBy) {
    case 'week':
      return {
        $concat: [
          { $toString: { $isoWeekYear: '$date' } },
          '-W',
          {
            $cond: [
              { $lt: [{ $isoWeek: '$date' }, 10] },
              { $concat: ['0', { $toString: { $isoWeek: '$date' } }] },
              { $toString: { $isoWeek: '$date' } },
            ],
          },
        ],
      };
    case 'month':
      return { $dateToString: { format: '%Y-%m', date: '$date' } };
    default:
      return { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
  }
}
