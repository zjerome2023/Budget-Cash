export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: messages[0] || 'Validation failed',
      errors: messages,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value already exists' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({
    message: err.message || 'Internal server error',
  });
}
