const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  quantity: Number,
  type: {
    type: String,
    enum: ['in', 'out']
  },
  notes: String
});

const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
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

itemSchema.pre('save', function(next) {
  this.totalStock = this.stockIn - this.stockOut;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema); 
