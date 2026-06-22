export function notFound(req, res) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  res.status(404).json({ message: 'Not found' });
}
