const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'collaborator', 'user'], default: 'user' },
  phoneNumber: { type: String },
  avatar: { type: String }, // Profile picture
  address: { type: String }, // Delivery address
  isLocked: { type: Boolean, default: false }, // Account lock status
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
