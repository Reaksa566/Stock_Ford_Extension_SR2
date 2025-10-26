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

// Get daily movements report
router.get('/daily-movements', auth, async (req, res) => {
  try {
    const { category, date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const items = await Item.find({
      category,
      'history.date': {
        $gte: startDate,
        $lt: endDate
      }
    });

    const dailyData = items.map(item => {
      const dailyMovements = item.history.filter(history => 
        history.date >= startDate && history.date < endDate
      );

      const dailyIn = dailyMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0);

      const dailyOut = dailyMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        ...item.toObject(),
        dailyIn,
        dailyOut,
        totalMovements: dailyMovements.length,
        movementDetails: dailyMovements.map(m => ({
          type: m.type,
          quantity: m.quantity,
          notes: m.notes,
          time: m.date.toLocaleTimeString()
        }))
      };
    }).filter(item => item.dailyIn > 0 || item.dailyOut > 0);

    res.json(dailyData);
  } catch (error) {
    console.error('Error fetching daily movements:', error);
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