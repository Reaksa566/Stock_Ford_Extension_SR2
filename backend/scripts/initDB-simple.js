const mongoose = require('mongoose');
const User = require('../src/models/User');

const initDB = async () => {
  try {
    // Hardcoded MongoDB connection string
    const MONGODB_URI = 'mongodb+srv://reaksawelcome_db_user:qK90tXhTalooCnGo@cluster1.vfl2upr.mongodb.net/stock_ford_extension?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Create default admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create default regular user
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await User.create({
        username: 'user',
        password: 'user123',
        role: 'user'
      });
      console.log('✅ Default user created');
      console.log('   Username: user');
      console.log('   Password: user123');
    } else {
      console.log('ℹ️ User already exists');
    }

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    console.log('Please check:');
    console.log('1. Your internet connection');
    console.log('2. MongoDB Atlas whitelist settings');
    console.log('3. MongoDB credentials');
    process.exit(1);
  }
};

initDB();