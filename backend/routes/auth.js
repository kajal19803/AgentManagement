const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { runValidation } = require('../middlewares/validate');
const loginLimiter = require('../middlewares/rateLimiter');
const { auth } = require('../middlewares/authMiddleware');
const csrfValidator = require('../middlewares/csrfValidator');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();
const sendSecurityAlert = require('../utils/sendSecurityAlert'); // Utility for email alert

// Utility: Allow only admin users
const ensureAdminUser = (user) => {
  if (!user || user.role !== 'admin') {
    throw new Error('Access denied: only admins can log in');
  }
};

// Route: Generate CSRF token and set in cookie
router.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: false,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
});
// Route: Admin login with CSRF + Rate Limiting + GeoIP logging
router.post('/login', loginLimiter, csrfValidator, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], runValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    ensureAdminUser(user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Get IP and user agent info
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Try fetching geo location
    let location = 'Unknown';
    try {
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (data?.city && data?.region && data?.country_name) {
        location = `${data.city}, ${data.region}, ${data.country_name}`;
      }
    } catch {}

    // Check if IP is new (not in previous login history)
    const isNewIp = !user.loginHistory.some(entry => entry.ip === ip);

    // Save login record (max last 50)
    await User.updateOne(
      { _id: user._id },
      { $push: { loginHistory: { $each: [{ timestamp: new Date(), ip, userAgent, location }], $slice: -50 } } }
    );

    // If new IP, send security alert email
    if (isNewIp) {
      await sendSecurityAlert(user.email, ip, location, userAgent);
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

    // Set JWT in cookie
    res.cookie('csrfToken', token, {
        httpOnly: false,
        sameSite: 'None',
        secure: true,
        maxAge: 2 * 60 * 60 * 1000,
      });

    res.json({ user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(403).json({ message: err.message || 'Unauthorised' });
  }
});

// Route: Logout by clearing cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Route: Get current logged-in user info
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
});

// Route: Get login analytics (admin only)
router.get('/login-analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const fullHistory = user.loginHistory || [];
    const recentLogins = fullHistory.slice(-5).reverse();
    const lastLogin = fullHistory[fullHistory.length - 1] || null;

    // Count logins per date
    const loginCounts = {};
    fullHistory.forEach(({ timestamp }) => {
      const date = new Date(timestamp).toISOString().slice(0, 10);
      loginCounts[date] = (loginCounts[date] || 0) + 1;
    });

    res.json({
      totalLogins: fullHistory.length,
      lastLogin,
      recentLogins,
      dailyLogins: loginCounts,
    });
  } catch (err) {
    console.error('Login analytics error:', err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

// Route: Clear login history (admin only)
router.delete('/login-history', auth, csrfValidator, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    user.loginHistory = [];
    await user.save();

    res.json({ message: 'Login history cleared successfully' });
  } catch (err) {
    console.error('Clear login history error:', err);
    res.status(500).json({ message: 'Failed to clear login history' });
  }
});

module.exports = router;









