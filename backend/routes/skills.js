const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const SkillLibrary = require('../models/SkillLibrary');
const UserSkill = require('../models/UserSkill');

router.get('/library', protect, async (req, res, next) => {
  try {
    const skills = await SkillLibrary.find().sort({ category: 1, skillName: 1 });
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

router.post('/library', protect, async (req, res, next) => {
  try {
    const skill = await SkillLibrary.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
});

router.get('/user', protect, async (req, res, next) => {
  try {
    const userSkills = await UserSkill.find({ userId: req.user.id }).populate('skillId');
    res.json({ success: true, data: userSkills });
  } catch (err) {
    next(err);
  }
});

router.post('/user', protect, async (req, res, next) => {
  try {
    const { skillId, status, proficiencyLevel, experienceNotes } = req.body;
    const userSkill = await UserSkill.create({
      userId: req.user.id,
      skillId,
      status,
      proficiencyLevel,
      experienceNotes,
    });
    const populated = await userSkill.populate('skillId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

router.delete('/user/:id', protect, async (req, res, next) => {
  try {
    const userSkill = await UserSkill.findById(req.params.id);
    if (!userSkill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    if (userSkill.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await userSkill.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
