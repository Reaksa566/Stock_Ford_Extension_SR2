require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../src/models/Item');

const clearItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all items
    const result = await Item.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} items from database`);

    process.exit(0);
  } catch (error) {
    console.error('Error clearing items:', error);
    process.exit(1);
  }
};

clearItems();