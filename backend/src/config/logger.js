const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const filterWarnMessage = format((info) => {
  return info.message.includes("[CORS] No origin detected. Blocking request in production.")
    ? info
    : undefined;
});

const excludeWarnMessage = form((info) => {
  return info.message.includes("[CORS] No origin detected. Blocking request in production.") ? false : info;
});

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message} ${meta}`;
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),

    // bot.log
    new DailyRotateFile({
      filename: `${logDirectory}/bot.log`,
      level: "warn",
      maxSize: "10m",
      maxFiles: 2,
      format: format.combine(
        filterWarnMessage(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
      zippedArchive: false,
    }),
    // error.log
    new DailyRotateFile({
      filename: `${logDirectory}/%DATE%-error.log`,
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // main.log
    new DailyRotateFile({
      filename: `${logDirectory}/%DATE%-main.log`,
      level: "info",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: format.combine(
        excludeWarnMessage(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: `${logDirectory}/exceptions.log`, level: "error" })],
});

logger.on("error", (err) => {
  console.error("Logger encountered an error:", err);
});

module.exports = logger;
