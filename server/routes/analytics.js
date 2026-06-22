import { Router } from 'express';
import { query } from 'express-validator';
import {
  getByCategory,
  getOverTime,
  getSummary,
} from '../controllers/analyticsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO date'),
];

const overTimeValidation = [
  ...dateRangeValidation,
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('groupBy must be day, week, or month'),
];

router.use(authenticate);

router.get('/summary', dateRangeValidation, handleValidation, asyncHandler(getSummary));
router.get('/by-category', dateRangeValidation, handleValidation, asyncHandler(getByCategory));
router.get('/over-time', overTimeValidation, handleValidation, asyncHandler(getOverTime));

export default router;
