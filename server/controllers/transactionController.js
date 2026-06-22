import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { parseExpenseDate } from '../utils/dates.js';

async function findOwnedCategory(userId, categoryId) {
  return Category.findOne({ _id: categoryId, userId });
}

function buildListFilter(userId, query) {
  const filter = { userId };

  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return filter;
}

export async function listTransactions(req, res) {
  try {
    const filter = buildListFilter(req.user._id, req.query);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('categoryId', 'name color');
    res.json({ transactions });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ message: 'Failed to list transactions' });
  }
}

export async function getTransaction(req, res) {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('categoryId', 'name color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Failed to get transaction' });
  }
}

export async function createTransaction(req, res) {
  try {
    const { categoryId, amount, description, date } = req.body;

    const category = await findOwnedCategory(req.user._id, categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      categoryId,
      amount,
      description,
      date: parseExpenseDate(date),
    });

    await transaction.populate('categoryId', 'name color');
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { categoryId, amount, description, date } = req.body;

    if (categoryId) {
      const category = await findOwnedCategory(req.user._id, categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updates = { categoryId, amount, description };
    if (date !== undefined) {
      updates.date = parseExpenseDate(date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
}
