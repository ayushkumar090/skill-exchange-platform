const mongoose = require('mongoose');

const SkillLibrarySchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    detailedDescription: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillLibrary', SkillLibrarySchema);
