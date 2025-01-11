const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = async () => {
  if (!MONGO_URI) {
    throw new Error("❌ Missing MongoDB connection URI in environment variables.");
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};


module.exports = {
  connectDatabase
};
