require('dotenv').config({ path: '../.env' }); // Point to the correct .env file
const mongoose = require('mongoose');
const User = require('../src/models/User');

const initDB = async () => {
  try {
    // Use the same connection string as in config.js
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://reaksawelcome_db_user:qK90tXhTalooCnGo@cluster1.vfl2upr.mongodb.net/stock_ford_extension?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create default admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created: username: admin, password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create default regular user
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await User.create({
        username: 'user',
        password: 'user123',
        role: 'user'
      });
      console.log('Default user created: username: user, password: user123');
    } else {
      console.log('User already exists');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error.message);
    process.exit(1);
  }
};

initDB();