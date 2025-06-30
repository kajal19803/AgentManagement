const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth, isAdmin } = require('../middlewares/authMiddleware');
const { runValidation } = require('../middlewares/validate');

const router = express.Router();

// Route to create a new agent (accessible by admin only)
router.post('/create', auth, isAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('countryCode').trim().matches(/^\+\d{1,4}$/).withMessage('Invalid country code format'),
  body('mobile').trim().custom((value, { req }) => {
      const code = req.body.countryCode;
      const number = value;
      if (!/^\d{7,15}$/.test(number)) {throw new Error('Mobile must be 7 to 15 digits');}
      // Country-specific mobile format validation
      switch (code) {
        case '+91': // India
          if (!/^[6-9]\d{9}$/.test(number)) {
            throw new Error('Indian mobile number must be 10 digits and start with 6-9');
          }
          break;
        case '+1': // USA/Canada
          if (!/^\d{10}$/.test(number)) {
            throw new Error('US/Canada number must be exactly 10 digits');
          }
          break;
        case '+44': // UK
          if (!/^\d{10,11}$/.test(number)) {
            throw new Error('UK number must be 10 or 11 digits');
          }
          break;
        case '+61': // Australia
          if (!/^\d{9}$/.test(number)) {
            throw new Error('Australian number must be 9 digits');
          }
          break;
        default:
          if (!/^\d{7,15}$/.test(number)) {
            throw new Error('Mobile must be between 7 to 15 digits');
          }
      }
      return true;
    }),
  body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one digit')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character (e.g., !@#$%)')

], runValidation, async (req, res) => {
  const { name, email, countryCode, mobile, password } = req.body;

  try {
    // Hash the password before saving
    const hashed = await bcrypt.hash(password, 10);
    
    // Create the agent with role = 'agent'
    const agent = await User.create({ name, email, countryCode, mobile, password: hashed, role: 'agent' });
    res.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    // Duplicate email error handling
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error. Could not create agent.' });
  }
});


// Route to get all agents (with pagination, search and optional deleted inclusion)
router.get('/', auth, isAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;
  const includeDeleted = req.query.includeDeleted === 'true';

  try {
    const searchRegex = new RegExp(search, 'i');

    // Build the filter based on query params
    const filter = {
      role: 'agent',
      ...(includeDeleted ? {} : { deleted: { $ne: true } }),
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
      ],
    };

    // Fetch agents based on filter and pagination
    const agents = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.json({
      agents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents.' });
  }
});


// Route to soft delete an agent (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent', deleted: false },
      { deleted: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Agent not found or already deleted.' });
    }

    res.json({ message: 'Agent soft deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error. Could not delete agent.' });
  }
});


// Route to restore a soft-deleted agent (admin only)
router.patch('/:id/restore', auth, isAdmin, async (req, res) => {
  try {
    const restored = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent', deleted: true },
      { deleted: false }
    );

    if (!restored) {
      return res.status(404).json({ message: 'Agent not found or already active.' });
    }

    res.json({ message: 'Agent restored successfully.' });
  } catch (error) {
    console.error('Error restoring agent:', error);
    res.status(500).json({ message: 'Server error. Could not restore agent.' });
  }
});

module.exports = router;




