// Import express-validator's result handler
const { validationResult } = require('express-validator');

// Validation middleware to check for request validation errors
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req); // Collect errors from previous validation middlewares

  // If any validation errors exist, return 400 with error details
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next(); // No errors, continue to next middleware or controller
};
