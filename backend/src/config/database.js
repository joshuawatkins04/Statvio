const mongoose = require("mongoose");
const logger = require("./logger");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = async () => {
  if (!MONGO_URI) {
    logger.error("Missing MongoDB connection URI in environment variables.");
    throw new Error("Missing MongoDB connection URI in environment variables.");
  }
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Successfully connected to MongoDB Atlas");
  } catch (error) {
    logger.error("MongoDB connection error:", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = {
  connectDatabase,
};
