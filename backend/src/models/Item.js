const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
});

const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['accessory', 'tool'],
    required: true
  },
  stockIn: {
    type: Number,
    default: 0
  },
  stockOut: {
    type: Number,
    default: 0
  },
  totalStock: {
    type: Number,
    default: 0
  },
  minStock: {
    type: Number,
    default: 0
  },
  history: [stockHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Fix the stock calculation
itemSchema.pre('save', function(next) {
  // Calculate total stock based on stockIn and stockOut
  this.totalStock = this.stockIn - this.stockOut;
  
  // Ensure total stock is never negative
  if (this.totalStock < 0) {
    this.totalStock = 0;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Add a method to update stock
itemSchema.methods.updateStock = function(type, quantity, notes = '') {
  if (type === 'in') {
    this.stockIn += quantity;
  } else if (type === 'out') {
    // Check if we have enough stock
    if (quantity > this.totalStock) {
      throw new Error('Insufficient stock');
    }
    this.stockOut += quantity;
  }
  
  // Add to history
  this.history.push({
    quantity: quantity,
    type: type,
    notes: notes || `${type.toUpperCase()} adjustment`,
    date: new Date()
  });
  
  // Recalculate total stock
  this.totalStock = this.stockIn - this.stockOut;
  this.updatedAt = Date.now();
};

module.exports = mongoose.model('Item', itemSchema);