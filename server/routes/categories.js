import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js';
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
  param('id').isMongoId().withMessage('Valid category id is required'),
];

const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a hex value like #3B82F6'),
];

const updateValidation = [
  ...idValidation,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a hex value like #3B82F6'),
];

router.use(authenticate);

router.get('/', listCategories);
router.post('/', createValidation, handleValidation, createCategory);
router.put('/:id', updateValidation, handleValidation, updateCategory);
router.delete('/:id', idValidation, handleValidation, deleteCategory);

export default router;
