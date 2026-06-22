import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const idValidation = [
  param('id').isMongoId().withMessage('Valid transaction id is required'),
];

const listQueryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO date'),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('categoryId must be a valid id'),
];

const transactionBodyValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Valid category id is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
];

const updateValidation = [
  ...idValidation,
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Valid category id is required'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
];

router.use(authenticate);

router.get('/', listQueryValidation, handleValidation, listTransactions);
router.get('/:id', idValidation, handleValidation, getTransaction);
router.post('/', transactionBodyValidation, handleValidation, createTransaction);
router.put('/:id', updateValidation, handleValidation, updateTransaction);
router.delete('/:id', idValidation, handleValidation, deleteTransaction);

export default router;
