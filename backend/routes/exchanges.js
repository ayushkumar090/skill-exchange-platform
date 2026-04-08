const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const SkillExchange = require('../models/SkillExchange');
const ExchangeFeedback = require('../models/ExchangeFeedback');
const User = require('../models/User');

router.get('/', protect, async (req, res, next) => {
  try {
    const exchanges = await SkillExchange.find({
      $or: [{ offerUserId: req.user.id }, { recipientUserId: req.user.id }],
    })
      .populate('offerUserId', 'username email overallRating')
      .populate('recipientUserId', 'username email overallRating')
      .populate({
        path: 'requestId',
        populate: {
          path: 'userSkillNeededId',
          populate: { path: 'skillId', select: 'skillName category' },
        },
      })
      .populate({ path: 'skillExchangeId', populate: { path: 'skillId', select: 'skillName category' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: exchanges });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { requestId, offerUserId, recipientUserId, skillExchangeId, scheduledTime, duration } = req.body;
    const exchange = await SkillExchange.create({
      requestId,
      offerUserId,
      recipientUserId,
      skillExchangeId,
      scheduledTime,
      duration,
    });
    res.status(201).json({ success: true, data: exchange });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/complete', protect, async (req, res, next) => {
  try {
    const exchange = await SkillExchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ success: false, error: 'Exchange not found' });
    }

    const isParticipant =
      exchange.offerUserId.toString() === req.user.id ||
      exchange.recipientUserId.toString() === req.user.id;
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    exchange.completedStatus = true;
    await exchange.save();

    const updateRating = async (userId) => {
      const userExchanges = await SkillExchange.find({
        $or: [{ offerUserId: userId }, { recipientUserId: userId }],
        completedStatus: true,
      });
      const exchangeIds = userExchanges.map((e) => e._id);
      const feedbacks = await ExchangeFeedback.find({ exchangeId: { $in: exchangeIds } });
      if (feedbacks.length > 0) {
        const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
        await User.findByIdAndUpdate(userId, { overallRating: Math.round(avg * 10) / 10 });
      }
    };

    await Promise.all([
      updateRating(exchange.offerUserId.toString()),
      updateRating(exchange.recipientUserId.toString()),
    ]);

    res.json({ success: true, data: exchange });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
