const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isFromAdmin: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminReply: {
    content: String,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'closed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
