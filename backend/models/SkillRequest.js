const mongoose = require('mongoose');

const SkillRequestSchema = new mongoose.Schema(
  {
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userSkillNeededId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillRequest', SkillRequestSchema);
