const mongoose = require('mongoose');

const UserSkillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillLibrary', required: true },
    status: { type: String, enum: ['Offering', 'Wanted'], required: true },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      required: true,
    },
    experienceNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSkill', UserSkillSchema);
