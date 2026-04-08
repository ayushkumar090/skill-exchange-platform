const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const ExchangeFeedback = require('../models/ExchangeFeedback');
const SkillExchange = require('../models/SkillExchange');

router.get('/:exchangeId', protect, async (req, res, next) => {
  try {
    const feedback = await ExchangeFeedback.find({ exchangeId: req.params.exchangeId })
      .populate('givenByUserId', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { exchangeId, rating, detailedReview } = req.body;

    const existing = await ExchangeFeedback.findOne({
      exchangeId,
      givenByUserId: req.user.id,
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already submitted feedback for this exchange' });
    }

    const exchange = await SkillExchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, error: 'Exchange not found' });
    }

    const isParticipant =
      exchange.offerUserId.toString() === req.user.id ||
      exchange.recipientUserId.toString() === req.user.id;
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not authorized to leave feedback for this exchange' });
    }

    const feedback = await ExchangeFeedback.create({
      exchangeId,
      givenByUserId: req.user.id,
      rating,
      detailedReview,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
