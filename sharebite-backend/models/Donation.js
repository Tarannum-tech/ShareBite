const mongoose = require('mongoose');
const donationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, category: { type: String, default: 'Cooked meals' },
  quantity: { type: Number, required: true, min: 1 }, unit: { type: String, default: 'portions' },
  location: { type: String, required: true, trim: true }, expiry: { type: String, default: '' },
  donor: { type: String, required: true, trim: true }, status: { type: String, enum: ['Available','Claimed','Completed'], default: 'Available' },
  description: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
