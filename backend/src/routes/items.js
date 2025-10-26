const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Item = require('../models/Item');
const { importFromExcel } = require('../utils/importExcel');

const router = express.Router();

// Get all items with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, sortBy, sortOrder = 'asc', page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const sortOptions = {};
    if (sortBy) sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
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
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 
