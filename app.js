const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimiter = require('./security/rateLimiter');
const applyHelmet = require('./security/helmet');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');
const routes = require('./routes');
const logger = require('./utils/logger.util');

const app = express();

// Basic middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Security
applyHelmet(app, helmet);
app.use(rateLimiter);

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// API routes
app.use('/api/v1', routes);

// 404 + error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

