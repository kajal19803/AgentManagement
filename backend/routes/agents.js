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
  body('mobile').trim().matches(/^\d{7,15}$/).withMessage('Mobile must be 7 to 15 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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




