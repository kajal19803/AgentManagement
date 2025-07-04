const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth, isAdmin } = require('../middlewares/authMiddleware');
const { runValidation } = require('../middlewares/validate');
const DistributedList = require('../models/DistributedList');

const router = express.Router();

// ✅ Create Agent
router.post('/create', auth, isAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('countryCode').trim().matches(/^\+\d{1,4}$/).withMessage('Invalid country code format'),
  body('mobile').trim().custom((value, { req }) => {
    const code = req.body.countryCode;
    const number = value;
    if (!/^\d{7,15}$/.test(number)) {
      throw new Error('Mobile must be 7 to 15 digits');
    }
    switch (code) {
      case '+91':
        if (!/^[6-9]\d{9}$/.test(number)) throw new Error('Indian number must be 10 digits and start with 6-9');
        break;
      case '+1':
        if (!/^\d{10}$/.test(number)) throw new Error('US/Canada number must be exactly 10 digits');
        break;
      case '+44':
        if (!/^\d{10,11}$/.test(number)) throw new Error('UK number must be 10 or 11 digits');
        break;
      case '+61':
        if (!/^\d{9}$/.test(number)) throw new Error('Australian number must be 9 digits');
        break;
      default:
        if (!/^\d{7,15}$/.test(number)) throw new Error('Mobile must be between 7 to 15 digits');
    }
    return true;
  }),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[a-z]/).withMessage('At least one lowercase letter required')
    .matches(/[A-Z]/).withMessage('At least one uppercase letter required')
    .matches(/[0-9]/).withMessage('At least one digit required')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('At least one special character required')
], runValidation, async (req, res) => {
  const { name, email, countryCode, mobile, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const agent = await User.create({
      name,
      email,
      countryCode,
      mobile,
      password: hashed,
      role: 'agent',
      createdBy: req.user._id // 👈 assign admin
    });
    res.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error. Could not create agent.' });
  }
});

// ✅ Get all agents with total task count
router.get('/', auth, isAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;
  const includeDeleted = req.query.includeDeleted === 'true';

  try {
    const searchRegex = new RegExp(search, 'i');
    const filter = {
      role: 'agent',
      createdBy: req.user._id, // 👈 only fetch own agents
      ...(includeDeleted ? {} : { deleted: { $ne: true } }),
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
      ],
    };

    const agents = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    const agentIds = agents.map(a => a._id);
    const distributions = await DistributedList.find({ agent: { $in: agentIds } });

    const countMap = {};
    distributions.forEach((dist) => {
      const id = dist.agent.toString();
      countMap[id] = (countMap[id] || 0) + (dist.list?.length || 0);
    });

    const agentsWithTasks = agents.map(agent => {
      const agentObj = agent.toObject();
      delete agentObj.password;
      return {
        ...agentObj,
        totalTasks: countMap[agent._id.toString()] || 0
      };
    });

    res.json({
      agents: agentsWithTasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents.' });
  }
});

// ✅ Soft Delete Agent (check ownership)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent', deleted: false, createdBy: req.user._id },
      { deleted: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Agent not found or unauthorized.' });
    }
    res.json({ message: 'Agent soft deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error. Could not delete agent.' });
  }
});

// ✅ Restore Agent (check ownership)
router.patch('/:id/restore', auth, isAdmin, async (req, res) => {
  try {
    const restored = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent', deleted: true, createdBy: req.user._id },
      { deleted: false }
    );
    if (!restored) {
      return res.status(404).json({ message: 'Agent not found or unauthorized.' });
    }
    res.json({ message: 'Agent restored successfully.' });
  } catch (error) {
    console.error('Error restoring agent:', error);
    res.status(500).json({ message: 'Server error. Could not restore agent.' });
  }
});

// ✅ Get tasks for specific agent (validate ownership)
router.get('/:id/tasks', auth, isAdmin, async (req, res) => {
  const agentId = req.params.id;

  try {
    const agent = await User.findOne({ _id: agentId, createdBy: req.user._id });
    if (!agent) {
      return res.status(403).json({ message: 'Unauthorized access to agent.' });
    }

    const distributedLists = await DistributedList.find({ agent: agentId }).sort({ uploadedAt: -1 });

    const tasks = distributedLists.flatMap(entry =>
      entry.list.map(task => ({
        ...task,
        uploadedAt: entry.uploadedAt
      }))
    );

    res.json({
      tasks,
      agentName: agent.name
    });
  } catch (error) {
    console.error('Error fetching tasks for agent:', error);
    res.status(500).json({ message: 'Server error. Could not fetch agent tasks.' });
  }
});

module.exports = router;







