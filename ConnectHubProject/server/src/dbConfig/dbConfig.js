import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// dbConfig.js should only handle connecting to MongoDB.
// Model definitions belong in the `models/` directory to avoid duplicate
// registrations and keep concerns separated.

export default connectDB;