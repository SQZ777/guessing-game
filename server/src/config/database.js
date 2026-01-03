const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB 已連線: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB 連線錯誤: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
