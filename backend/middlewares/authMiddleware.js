const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate any logged-in user (admin or agent)
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user; // Attach user to req object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

//  Middleware to allow only admins
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};

//  Middleware to allow only agents
const isAgent = (req, res, next) => {
  if (req.user?.role !== 'agent') {
    return res.status(403).json({ message: 'Agents only' });
  }
  next();
};

module.exports = { auth, isAdmin, isAgent };
