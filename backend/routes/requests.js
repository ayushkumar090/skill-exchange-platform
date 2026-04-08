const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const SkillRequest = require('../models/SkillRequest');
const UserSkill = require('../models/UserSkill');

router.get('/', protect, async (req, res, next) => {
  try {
    const mySkills = await UserSkill.find({ userId: req.user.id });
    const mySkillIds = mySkills.map((s) => s._id);

    const requests = await SkillRequest.find({
      $or: [
        { senderUserId: req.user.id },
        { userSkillNeededId: { $in: mySkillIds } },
      ],
    })
      .populate('senderUserId', 'username email')
      .populate({
        path: 'userSkillNeededId',
        populate: { path: 'skillId userId', select: 'skillName category username email' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { userSkillNeededId, message } = req.body;
    const request = await SkillRequest.create({
      senderUserId: req.user.id,
      userSkillNeededId,
      message,
    });
    await request.populate('senderUserId', 'username email');
    await request.populate({
      path: 'userSkillNeededId',
      populate: { path: 'skillId userId', select: 'skillName category username email' },
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id).populate('userSkillNeededId');
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const skillOwner = request.userSkillNeededId.userId.toString();
    if (skillOwner !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this request' });
    }

    request.status = req.body.status;
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
