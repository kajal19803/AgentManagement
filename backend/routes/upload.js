const express = require('express');
const multer = require('multer');
const { body, query, param } = require('express-validator');
const { runValidation } = require('../middlewares/validate');
const { auth, isAdmin } = require('../middlewares/authMiddleware');

const {uploadAndDistribute,getLatestList,getHistory,getHistoryByTimestamp,
} = require('../controllers/uploadController');

const router = express.Router();

// Multer setup: 5MB limit, allow only CSV/XLSX/XLS
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = require('path').extname(file.originalname).toLowerCase();
    cb(null, ['.csv', '.xlsx', '.xls'].includes(ext));
  },
});

// Upload file and distribute data
router.post('/',auth,isAdmin,upload.single('file'),
  [
    body('agents')
      .notEmpty().withMessage('Agent list required')
      .custom((v) => {
        const parsed = JSON.parse(v);
        if (!Array.isArray(parsed) || !parsed.length) throw new Error();
        return true;
      }),
  ],runValidation,uploadAndDistribute
);

// Get latest distributed list
router.get('/lists',auth,isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim().escape(),
  ],runValidation,getLatestList
);

// Get all distribution history
router.get('/history',auth,isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim().escape(),
    query('minAgents').optional().isInt({ min: 0 }),
    query('maxAgents').optional().isInt({ min: 1 }),
  ],runValidation,getHistory
);

// Get batch distribution by timestamp
router.get('/history/:timestamp',auth,isAdmin,
  [
    param('timestamp').isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim().escape(),
  ],runValidation,getHistoryByTimestamp
);

module.exports = router;






