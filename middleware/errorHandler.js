// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // 1. LOG THE ERROR TO THE CONSOLE
  // This is the most important part. It makes the error visible to you, the developer.
  // err.stack provides the most detail, including where the error occurred.
  console.error('\x1b[31m', '--- UNHANDLED ERROR ---'); // Adds red color to the log
  console.error(err.stack);
  console.error('--- END ERROR ---');

  // 2. DETERMINE THE STATUS CODE
  // If the response already has a status code, use it. Otherwise, default to 500.
  const statusCode = res.statusCode ? res.statusCode : 500;

  // 3. SEND A GENERIC JSON RESPONSE TO THE FRONTEND
  // We don't want to send the detailed error stack to the user for security reasons.
  res.status(statusCode).json({
    message: 'An unexpected error occurred on the server.',
    // In development mode, you can optionally send the stack for easier debugging on the frontend.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };