import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from '../controllers/transactionController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

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

router.get('/', listQueryValidation, handleValidation, asyncHandler(listTransactions));
router.get('/:id', idValidation, handleValidation, asyncHandler(getTransaction));
router.post('/', transactionBodyValidation, handleValidation, asyncHandler(createTransaction));
router.put('/:id', updateValidation, handleValidation, asyncHandler(updateTransaction));
router.delete('/:id', idValidation, handleValidation, asyncHandler(deleteTransaction));

export default router;
