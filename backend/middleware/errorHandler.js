export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, _next) {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.expose ? err.message : 'Internal server error.',
  });
}
