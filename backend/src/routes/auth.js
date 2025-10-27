const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Add auth middleware (simple version)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Your existing login route
router.post('/login', async (req, res) => {
  // ... your existing login code ...
});

// ADD THIS ROUTE - /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    console.log('✅ /me route called for user:', req.user.username);
    
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('❌ /me route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;