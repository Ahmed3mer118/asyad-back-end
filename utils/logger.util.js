const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
      return `Timestamp: ${timestamp}; Level: ${level.toUpperCase()}; Message: ${message}; Meta: ${JSON.stringify(
        meta
      )}; Stack: ${stack ? stack : " "}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logsDir, "success.log"), level: "info" }),
    new transports.File({ filename: path.join(logsDir, "combined.log") })
  ]
});

module.exports = logger;
