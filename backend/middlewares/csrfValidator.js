// CSRF Token Validator Middleware
module.exports = function csrfValidator(req, res, next) {
  const csrfCookie = req.cookies.csrfToken;          // Token from cookie
  const csrfHeader = req.headers['x-csrf-token'];    // Token from request header

  // Check if both tokens exist and match
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next(); // Token is valid, proceed to next middleware/route
};
