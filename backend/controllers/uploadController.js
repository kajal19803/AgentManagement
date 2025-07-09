const csv = require('csvtojson');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const DistributedList = require('../models/DistributedList');
const User = require('../models/User');

// Parse uploaded CSV or Excel file
function parseFile(filePath, mimetype) {
  if (mimetype === 'text/csv') return csv().fromFile(filePath);
  else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel'
  ) {
    const sheet = xlsx.readFile(filePath, { cellDates: true }).Sheets;
    return xlsx.utils.sheet_to_json(sheet[Object.keys(sheet)[0]], { defval: '' });
  } else throw new Error('Invalid file format');
}

// Upload and distribute to selected agents
exports.uploadAndDistribute = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only CSV, XLSX, and XLS files are allowed.' });
    }

    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid file type based on MIME type.' });
    }

    const selectedAgentIds = JSON.parse(req.body.agents);
    const agents = await User.find({ _id: { $in: selectedAgentIds }, role: 'agent' });

    if (!agents.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'No valid agents selected' });
    }

    const data = await parseFile(req.file.path, req.file.mimetype);
    fs.unlinkSync(req.file.path);
    if (!data.length) return res.status(400).json({ message: 'Uploaded file is empty.' });

    const chunks = Array.from({ length: agents.length }, () => []);
    data.forEach((entry, i) => {
    chunks[i % agents.length].push({
     ...entry,
    status: 'assigned'  
     });
    });


    const uploadedAt = new Date();
    await Promise.all(
      chunks.map((chunk, i) =>
        DistributedList.create({
          agent: agents[i]._id,
          list: chunk,
          uploadedAt,
          createdBy: req.user._id,
        })
      )
    );

    res.json({ message: 'Data distributed successfully' });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'Server error while processing the file' });
  }
};

// Get latest distributed data
exports.getLatestList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1,
      limit = parseInt(req.query.limit) || 5,
      search = req.query.search || '',
      skip = (page - 1) * limit;

    const latest = await DistributedList.findOne({ createdBy: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('uploadedAt');

    if (!latest) return res.json({ lists: [], total: 0 });

    const latestDate = latest.uploadedAt;
    const match = {
      uploadedAt: latestDate,
      createdBy: req.user._id,
    };

    const searchMatch = search
      ? {
          ...match,
          $or: [
            { 'agent.name': { $regex: search, $options: 'i' } },
            { 'agent.email': { $regex: search, $options: 'i' } },
          ],
        }
      : match;

    const lists = await DistributedList.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'agent',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      { $match: search ? searchMatch : match },
      { $sort: { 'agent.name': 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalArr = await DistributedList.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'agent',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      { $match: search ? searchMatch : match },
      { $count: 'count' },
    ]);

    res.json({ lists, total: totalArr[0]?.count || 0 });
  } catch (error) {
    console.error('List fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch lists.' });
  }
};

// Get upload history
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1,
      limit = parseInt(req.query.limit) || 5,
      search = req.query.search || '';
    const min = parseInt(req.query.minAgents) || 0,
      max = parseInt(req.query.maxAgents) || Infinity,
      skip = (page - 1) * limit;

    const grouped = await DistributedList.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$uploadedAt', totalAgents: { $addToSet: '$agent' } } },
      { $sort: { _id: -1 } },
    ]);

    const filtered = grouped
      .map((g) => ({
        uploadedAt: g._id instanceof Date ? g._id.toISOString() : null,
        agentsCount: g.totalAgents.length,
      }))
      .filter(
        (g) =>
          g.uploadedAt &&
          g.uploadedAt.includes(search) &&
          g.agentsCount >= min &&
          g.agentsCount <= max
      );

    res.json({ history: filtered.slice(skip, skip + limit), total: filtered.length });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// Get full list for a given upload timestamp
exports.getHistoryByTimestamp = async (req, res) => {
  try {
    const timestamp = new Date(req.params.timestamp),
      page = parseInt(req.query.page) || 1,
      limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '',
      skip = (page - 1) * limit;

    const baseMatch = {
      uploadedAt: { $eq: timestamp },
      createdBy: req.user._id,
    };

    const match = search
      ? {
          ...baseMatch,
          $or: [
            { 'agent.name': { $regex: search, $options: 'i' } },
            { 'agent.email': { $regex: search, $options: 'i' } },
          ],
        }
      : baseMatch;

    const lists = await DistributedList.aggregate([
      { $match: baseMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'agent',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      { $match: match },
      { $sort: { 'agent.name': 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          list: 1,
          uploadedAt: 1,
          'agent._id': 1,
          'agent.name': 1,
          'agent.email': 1,
          'agent.deleted': 1,
        },
      },
    ]);

    const countArr = await DistributedList.aggregate([
      { $match: baseMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'agent',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      { $match: match },
      { $count: 'count' },
    ]);

    res.json({ list: lists, total: countArr[0]?.count || 0 });
  } catch (error) {
    console.error('Fetch history detail error:', error);
    res.status(500).json({ message: 'Failed to fetch distribution detail' });
  }
};
