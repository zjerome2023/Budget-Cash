import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import {
  getByCategory,
  getOverTime,
  getSummary,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

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

router.get('/summary', dateRangeValidation, handleValidation, getSummary);
router.get('/by-category', dateRangeValidation, handleValidation, getByCategory);
router.get('/over-time', overTimeValidation, handleValidation, getOverTime);

export default router;
