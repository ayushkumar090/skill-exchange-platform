const mongoose = require('mongoose');

const SkillExchangeSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillRequest', required: true },
    offerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillExchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill' },
    scheduledTime: { type: Date },
    duration: { type: Number },
    completedStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillExchange', SkillExchangeSchema);
