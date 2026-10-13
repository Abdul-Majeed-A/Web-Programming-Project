export const errorHandler = (err, req, res, next) => {
  console.error('[Error caught by global handler]:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the permitted limit (maximum 15MB).',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'An unexpected server error occurred. Please try again later.';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
