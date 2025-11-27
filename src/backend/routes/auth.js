const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const User = require('../models/User');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: '🌸 Mã OTP đặt lại mật khẩu - Hoa Kiểng',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌸 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Đây là mã OTP của bạn:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>Mã OTP này có hiệu lực trong <strong>10 phút</strong>.</p>
            <p class="warning">⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <div class="footer">
              <p>© 2024 Hoa Kiểng - Mang thiên nhiên vào ngôi nhà của bạn</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Note: SMS functionality requires a service like Twilio, currently simulated
const sendOTPSMS = async (phoneNumber, otp) => {
  // In production, integrate with Twilio or similar SMS service
  console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
  // For now, return success to simulate SMS sending
  return { success: true, message: 'SMS sent (simulated)' };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email in use' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hash });
    await user.save();
    res.json({ message: 'Registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phoneNumber,
        address: user.address,
        avatar: user.avatar,
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier, method } = req.body; // identifier: email or phone, method: 'email' or 'sms'
    
    if (!identifier || !method) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email/số điện thoại và phương thức gửi OTP' });
    }

    // Find user by email or phone
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: identifier });
    } else if (method === 'sms') {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với thông tin này' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // Send OTP
    if (method === 'email') {
      const emailResult = await sendOTPEmail(user.email, otp, user.name);
      if (!emailResult.success) {
        return res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại sau.' });
      }
      return res.json({ message: 'Mã OTP đã được gửi đến email của bạn', method: 'email' });
    } else if (method === 'sms') {
      const smsResult = await sendOTPSMS(user.phoneNumber, otp);
      if (!smsResult.success) {
        return res.status(500).json({ message: 'Không thể gửi SMS. Vui lòng thử lại sau.' });
      }
      return res.json({ message: 'Mã OTP đã được gửi đến số điện thoại của bạn', method: 'sms' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp, method } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    // Find user
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check OTP and expiry
    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác' });
    }

    // OTP is valid
    res.json({ message: 'Xác thực OTP thành công', userId: user._id });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword, method } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    // Find user
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Verify OTP one more time
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hash;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
