// routes/tasks.js
const express = require('express');
const DistributedList = require('../models/DistributedList');
const User = require('../models/User');
const { auth, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/tasks - fetch all tasks across all agents
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    // Fetch all distributions, populate agent name
    const distributions = await DistributedList.find()
      .sort({ uploadedAt: -1 })
      .populate('agent', 'name email');

    // Flatten tasks with agent info
    const tasks = distributions.flatMap(dist =>
      dist.list.map(task => ({
        ...task,
        uploadedAt: dist.uploadedAt,
        agentName: dist.agent.name,
        agentEmail: dist.agent.email
      }))
    );

    res.json({
      totalTasks: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Error fetching all tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

module.exports = router;
