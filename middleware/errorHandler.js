// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('\x1b[31m', '--- UNHANDLED ERROR ---');
  console.error(err.stack);
  console.error('--- END ERROR ---');

  // THE FIX: If the status code is still 200 (default), force it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred on the server.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };