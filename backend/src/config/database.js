const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    throw new Error("Missing MongoDB connection URI in env variables.");
  }
  try {
    const connection = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;
