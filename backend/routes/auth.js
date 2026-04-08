const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, bio, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide username, email, and password' });
    }
    const user = await User.create({ username, email, password, bio, role });
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, data: { id: user._id, username: user.username, email: user.email, role: user.role, bio: user.bio } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = user.getSignedJwtToken();
    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        overallRating: user.overallRating,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { bio, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, role },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
