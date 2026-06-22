import mongoose from 'mongoose';

export function buildDateMatch(userId, query) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) {
      match.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
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
