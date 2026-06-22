import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const idValidation = [
  param('id').isMongoId().withMessage('Valid category id is required'),
];

const createValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a hex value like #3B82F6'),
];

const updateValidation = [
  ...idValidation,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a hex value like #3B82F6'),
];

router.use(authenticate);

router.get('/', asyncHandler(listCategories));
router.post('/', createValidation, handleValidation, asyncHandler(createCategory));
router.put('/:id', updateValidation, handleValidation, asyncHandler(updateCategory));
router.delete('/:id', idValidation, handleValidation, asyncHandler(deleteCategory));

export default router;
