const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Map phoneNumber to phone for frontend compatibility
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      isLocked: user.isLocked
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Update user profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, address, avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone !== user.phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber: phone, _id: { $ne: req.user.id } });
      if (phoneExists) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phoneNumber = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isLocked: user.isLocked
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Change password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
