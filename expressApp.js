const express = require("express");
const router = require("./router.js");
const logger = require("./utils/logger.util");
const errorHandler = require("./middleware/error-handler.middleware");
const corsMiddleware = require("./middleware/cors.middleware");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Request: ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`, {
      user: req.user?.id
    });
  });
  next();
});

app.use("/api/v1", router);
app.use(errorHandler);

module.exports = app;
