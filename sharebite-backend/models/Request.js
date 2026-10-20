const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  donationId: { type: String, required: true }, donationTitle: { type: String, required: true },
  requester: { type: String, required: true }, requesterRole: { type: String, default: 'needy' },
  quantity: { type: Number, default: 1 }, status: { type: String, enum: ['Pending','Approved','Rejected','Completed'], default: 'Pending' },
  volunteer: { type: String, default: 'Not assigned' }, location: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.models.Request || mongoose.model('Request', schema);
