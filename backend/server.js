const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file'); // For rotating error logs
require('dotenv').config();

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by'); // Hide Express fingerprint

// Secure headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc:["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

// NoSQL Injection Sanitizer
app.use((req, res, next) => {
  const sanitize = mongoSanitize.sanitize;
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.headers) sanitize(req.headers);
  next();
});

app.use(express.json({ limit: '10kb' })); // Limit request size
app.use(cookieParser());

// Dynamically read allowed origins from .env
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true,
}));

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));

// Logging setup

// Access logs written to logs/access.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Error logs with daily rotation
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log', // File name pattern
  datePattern: 'YYYY-MM-DD',         // Rotate daily
  maxSize: '5m',                     // Max size of each file
  maxFiles: '7d',                    // Keep logs for 7 days
  zippedArchive: true,              // Compress old logs
  level: 'error'
});

// Winston logger instance
const logger = winston.createLogger({
  level: 'error',
  transports: [
    errorRotateTransport,
    new winston.transports.Console({ format: winston.format.simple() })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/upload', require('./routes/upload'));

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max allowed size is 5MB.' });
  }
  if (err.message.includes('Only CSV')) {
    return res.status(400).json({ message: err.message });
  }
  logger.error('Unexpected error', { message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Something went wrong.' });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));






