const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Item = require('../models/Item');
const { importFromExcel } = require('../utils/importExcel');

const router = express.Router();

// Get all items with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sortBy, 
      sortOrder = 'asc', 
      page = 1, 
      limit = 10, 
      stockStatus, 
      unit 
    } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (unit) {
      query.unit = unit;
    }

    // Handle stock status filters
    if (stockStatus) {
      switch (stockStatus) {
        case 'critical':
          query.$expr = { $lt: ['$totalStock', { $multiply: ['$stockIn', 0.2] }] };
          break;
        case 'low':
          query.$expr = { 
            $and: [
              { $gte: ['$totalStock', { $multiply: ['$stockIn', 0.2] }] },
              { $lt: ['$totalStock', { $multiply: ['$stockIn', 0.5] }] }
            ]
          };
          break;
        case 'good':
          query.$expr = { $gte: ['$totalStock', { $multiply: ['$stockIn', 0.5] }] };
          break;
        case 'out':
          query.totalStock = 0;
          break;
      }
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.description = 1; // Default sort
    }

    const items = await Item.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create item (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update item (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete item (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import from Excel (Admin only)
router.post('/import', auth, adminAuth, async (req, res) => {
  try {
    const { category, data } = req.body;
    const result = await importFromExcel(data, category);
    res.json(result);
  } catch (error) {
    console.error('Error importing Excel:', error);
    res.status(400).json({ message: error.message });
  }
});

// Stock adjustment (Admin only)
router.post('/:id/stock-adjustment', auth, adminAuth, async (req, res) => {
  try {
    const { type, quantity, notes } = req.body;
    
    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "in" or "out"' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check for sufficient stock when doing stock out
    if (type === 'out' && quantity > item.totalStock) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${item.totalStock}, Requested: ${quantity}` 
      });
    }

    // Use the updateStock method
    item.updateStock(type, parseInt(quantity), notes);
    await item.save();

    res.json({
      message: `Stock ${type} updated successfully`,
      item: {
        stockIn: item.stockIn,
        stockOut: item.stockOut,
        totalStock: item.totalStock
      }
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;