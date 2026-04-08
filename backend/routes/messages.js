const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Message = require('../models/Message');

router.get('/:userId', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderUserId: req.user.id, recipientUserId: req.params.userId },
        { senderUserId: req.params.userId, recipientUserId: req.user.id },
      ],
    })
      .populate('senderUserId', 'username')
      .populate('recipientUserId', 'username')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { senderUserId: req.params.userId, recipientUserId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { recipientUserId, message } = req.body;
    const msg = await Message.create({
      senderUserId: req.user.id,
      recipientUserId,
      message,
    });
    await msg.populate('senderUserId', 'username');
    await msg.populate('recipientUserId', 'username');
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
});

router.put('/:userId/read', protect, async (req, res, next) => {
  try {
    await Message.updateMany(
      { senderUserId: req.params.userId, recipientUserId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
