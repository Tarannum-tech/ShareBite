const mongoose = require('mongoose');
const schema = new mongoose.Schema({ donationId: { type: String, required: true }, title: { type: String, required: true },
  pickup: { type: String, default: 'Donor location' }, dropoff: { type: String, default: '' }, location: { type: String, default: '' },
  status: { type: String, enum: ['Available','In progress','Completed'], default: 'Available' }, volunteer: { type: String, default: 'Unassigned' }
}, { timestamps: true });
module.exports = mongoose.models.Delivery || mongoose.model('Delivery', schema);
