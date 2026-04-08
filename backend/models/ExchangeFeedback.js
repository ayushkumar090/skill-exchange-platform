const mongoose = require('mongoose');

const ExchangeFeedbackSchema = new mongoose.Schema(
  {
    exchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillExchange', required: true },
    givenByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    detailedReview: { type: String },
    flaggedAsInappropriate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExchangeFeedback', ExchangeFeedbackSchema);
