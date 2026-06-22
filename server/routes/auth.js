import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMe,
  login,
  logout,
  register,
} from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, handleValidation, asyncHandler(register));
router.post('/login', loginValidation, handleValidation, asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getMe));
router.post('/logout', authenticate, logout);

export default router;
