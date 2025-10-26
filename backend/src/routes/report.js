const express = require('express');
const { auth } = require('../middleware/auth');
const Item = require('../models/Item');

const router = express.Router();

// Get critical stock report (stock out < 20% of stock in)
router.get('/critical-stock', auth, async (req, res) => {
  try {
    const items = await Item.find({
      $expr: {
        $lt: [
          '$totalStock',
          { $multiply: ['$stockIn', 0.2] }
        ]
      }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily report
router.get('/daily', auth, async (req, res) => {
  try {
    const { category, date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    let query = {
      'history.date': {
        $gte: startDate,
        $lt: endDate
      }
    };

    if (category) query.category = category;

    const items = await Item.find(query);

    const dailyData = items.map(item => ({
      item: item.description,
      transactions: item.history.filter(history => 
        history.date >= startDate && history.date < endDate
      )
    }));

    res.json(dailyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get summary report
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalStockIn: { $sum: '$stockIn' },
          totalStockOut: { $sum: '$stockOut' },
          totalCurrentStock: { $sum: '$totalStock' }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
