const mongoose = require('mongoose');

// Connect to MongoDB Atlas using DB_URL from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
