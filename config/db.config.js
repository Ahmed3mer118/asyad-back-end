const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = process.env.DB_URL;
    if (!connectionString) {
      const err = new Error("DB_URL is not set");
      if (process.env.VERCEL) throw err;
      console.log("Database connection error: DB_URL is not set");
      process.exit(1);
    }
    const connection = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected : ${connection.connection.host}`);
  } catch (err) {
    console.log(`Database connection error: ${err.message}`);
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }
};

module.exports = connectDB;