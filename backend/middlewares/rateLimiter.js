const rateLimit = require('express-rate-limit');

// Limit login attempts to 10 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15* 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;
