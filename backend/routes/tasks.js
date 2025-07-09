// routes/tasks.js
const express = require('express');
const DistributedList = require('../models/DistributedList');
const User = require('../models/User');
const { auth, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/tasks - fetch all tasks across all agents
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const adminId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    // Fetch distributions created by this admin
    const distributions = await DistributedList.find({ createdBy: adminId })
      .sort({ uploadedAt: -1 })
      .populate('agent', 'name email');

    // Flatten all tasks with meta info
    const allTasks = distributions.flatMap(dist =>
      dist.list.map(task => ({
        firstName: task.firstName,
        phone: task.phone,
        notes: task.notes,
        status: task.status,
        uploadedAt: dist.uploadedAt,
        agentName: dist.agent?.name,
        agentEmail: dist.agent?.email
      }))
    );

    const totalTasks = allTasks.length;
    const totalPages = Math.ceil(totalTasks / limit);

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedTasks = allTasks.slice(startIndex, startIndex + limit);

    res.json({
      totalTasks,
      totalPages,
      currentPage: page,
      tasks: paginatedTasks
    });
  } catch (err) {
    console.error('Error fetching admin tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

module.exports = router;
