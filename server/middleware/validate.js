import { validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array();
    return res.status(400).json({
      message: formatted[0].msg,
      errors: formatted,
    });
  }
  next();
}
