const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { requireAuth, requireAdmin, requireAdminOrCollaborator } = require('../middleware/auth');

// User sends message
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    const message = new Message({
      user: req.user.id,
      userName: req.user.name || 'User',
      userEmail: req.user.email || 'no-email@example.com',
      content: content.trim()
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's messages (for current logged-in user)
router.get('/my-messages', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('adminReply.repliedBy', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all messages (Admin/Collaborator)
router.get('/', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email avatar')
      .populate('adminReply.repliedBy', 'name');
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get conversations grouped by user (Admin/Collaborator)
router.get('/conversations', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$user',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$isFromAdmin', false] }] }, 1, 0] }
          },
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          userAvatar: '$userInfo.avatar',
          lastMessage: '$lastMessage.content',
          lastMessageTime: '$lastMessage.createdAt',
          lastMessageFrom: '$lastMessage.isFromAdmin',
          unreadCount: 1,
          messageCount: 1,
          status: '$lastMessage.status'
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for a specific conversation (Admin/Collaborator)
router.get('/conversation/:userId', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.params.userId })
      .sort({ createdAt: 1 })
      .populate('user', 'name email avatar')
      .populate('adminReply.repliedBy', 'name avatar');
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message to user (Admin/Collaborator)
router.post('/conversation/:userId/reply', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.params.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    // Get user info
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const message = new Message({
      user: userId,
      userName: user.name,
      userEmail: user.email,
      content: content.trim(),
      isFromAdmin: true,
      isRead: true
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('user', 'name email avatar');
    
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single message
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('adminReply.repliedBy', 'name avatar');
    
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }

    // Check permission: user can only see their own messages, admin/collaborator can see all
    if (req.user.role !== 'admin' && req.user.role !== 'collaborator' && message.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin/Collaborator reply to message
router.put('/:id/reply', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }

    message.adminReply = {
      content: content.trim(),
      repliedBy: req.user.id,
      repliedAt: new Date()
    };
    message.status = 'replied';

    await message.save();
    
    const updatedMessage = await Message.findById(message._id)
      .populate('user', 'name email')
      .populate('adminReply.repliedBy', 'name');

    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark message as read
router.put('/:id/read', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update message status
router.put('/:id/status', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')
     .populate('adminReply.repliedBy', 'name');
    
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete message (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }

    res.json({ message: 'Đã xóa tin nhắn thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get message statistics (Admin only)
router.get('/stats/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [total, pending, replied, closed, unread] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ status: 'pending' }),
      Message.countDocuments({ status: 'replied' }),
      Message.countDocuments({ status: 'closed' }),
      Message.countDocuments({ isRead: false })
    ]);

    res.json({
      total,
      pending,
      replied,
      closed,
      unread
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
