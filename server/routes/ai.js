import { Router } from 'express';
import { body } from 'express-validator';
import {
  spendingInsights,
  suggestCategory,
} from '../controllers/aiController.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const suggestCategoryValidation = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 3, max: 500 })
    .withMessage('Description must be between 3 and 500 characters'),
];

const spendingInsightsValidation = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO date'),
  body('dateRangeLabel')
    .optional()
    .trim()
    .isString()
    .withMessage('dateRangeLabel must be a string')
    .isLength({ max: 100 })
    .withMessage('dateRangeLabel must be at most 100 characters'),
  body('forceRefresh')
    .optional()
    .isBoolean()
    .withMessage('forceRefresh must be a boolean'),
];

router.use(authenticate);
router.use(aiRateLimiter);

router.post(
  '/suggest-category',
  suggestCategoryValidation,
  handleValidation,
  asyncHandler(suggestCategory)
);
router.post(
  '/spending-insights',
  spendingInsightsValidation,
  handleValidation,
  asyncHandler(spendingInsights)
);

export default router;
