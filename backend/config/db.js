const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected✅");
  } catch (err) {
    // Do not expose the MongoDB connection string or internal
    // connection details in application logs.
    console.error("MongoDB connection error❌");

    process.exit(1);
  }
};

module.exports = connectDB;
