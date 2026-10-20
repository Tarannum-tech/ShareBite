const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['donor','charity','volunteer','needy'], required: true }
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
