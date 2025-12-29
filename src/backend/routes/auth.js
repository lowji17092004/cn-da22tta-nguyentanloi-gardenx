const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const User = require('../models/User');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    from: `"FLORÉN" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
    to: email,
    subject: '🌿 Mã OTP đặt lại mật khẩu - FLORÉN',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background: #f4f4f4;
          }
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container { 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 50%, #6b9d64 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo-container {
            background: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .logo-icon {
            font-size: 40px;
          }
          .brand-name {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            letter-spacing: 1px;
          }
          .brand-tagline {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting {
            font-size: 18px;
            color: #2d5a27;
            margin-bottom: 15px;
          }
          .message {
            color: #666;
            margin-bottom: 30px;
            font-size: 15px;
          }
          .otp-section {
            background: linear-gradient(135deg, #f8fdf7 0%, #e8f5e6 100%);
            border: 2px solid #4a7c43;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code { 
            font-size: 42px; 
            font-weight: 700; 
            color: #2d5a27; 
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
          }
          .otp-expire {
            font-size: 13px;
            color: #888;
            margin-top: 15px;
          }
          .otp-expire strong {
            color: #e74c3c;
          }
          .info-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .info-box p {
            margin: 0;
            color: #856404;
            font-size: 14px;
          }
          .warning { 
            background: #fee;
            border-left: 4px solid #e74c3c;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .warning p {
            margin: 0;
            color: #c0392b;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #ddd, transparent);
            margin: 30px 0;
          }
          .footer { 
            background: #f9f9f9;
            text-align: center; 
            padding: 25px 30px; 
            border-top: 1px solid #eee;
          }
          .footer-logo {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .footer-text {
            color: #999; 
            font-size: 12px; 
            margin: 5px 0;
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #4a7c43;
            text-decoration: none;
          }
          .contact-info {
            font-size: 12px;
            color: #888;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <span class="logo-icon">�</span>
              </div>
              <h1 class="brand-name">FLORÉN</h1>
              <p class="brand-tagline">Mang thiên nhiên vào ngôi nhà của bạn</p>
            </div>
            <div class="content">
              <p class="greeting">Xin chào <strong>${userName}</strong> 👋</p>
              <p class="message">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FLORÉN. 
                Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
              </p>
              
              <div class="otp-section">
                <p class="otp-label">Mã xác thực của bạn</p>
                <div class="otp-code">${otp}</div>
                <p class="otp-expire">Mã có hiệu lực trong <strong>10 phút</strong></p>
              </div>
              
              <div class="info-box">
                <p>💡 <strong>Mẹo:</strong> Bạn có thể sao chép và dán mã OTP trực tiếp vào ô nhập liệu.</p>
              </div>
              
              <div class="warning">
                <p>⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn sẽ an toàn.</p>
              </div>
              
              <div class="divider"></div>
              
              <p style="color: #888; font-size: 13px; text-align: center;">
                Email này được gửi tự động. Vui lòng không trả lời email này.
              </p>
            </div>
            <div class="footer">
              <div class="footer-logo">�🌱🍃</div>
              <p class="footer-text"><strong>FLORÉN</strong></p>
              <p class="footer-text">Mang thiên nhiên vào ngôi nhà của bạn</p>
              <div class="contact-info">
                <p>📍 123 Đường ABC, Quận XYZ, TP. Trà Vinh</p>
                <p>📞 0123 456 789 | ✉️ support@floren.vn</p>
              </div>
              <p class="footer-text" style="margin-top: 15px;">© 2024 FLORÉN. All rights reserved.</p>
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

// Send Verification Email for Registration
const sendVerificationEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"FLORÉN" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
    to: email,
    subject: '🌿 Xác minh email đăng ký - FLORÉN',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background: #f4f4f4;
          }
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container { 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 50%, #6b9d64 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo-container {
            background: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .logo-icon { font-size: 40px; }
          .brand-name { font-size: 28px; font-weight: 700; margin: 0 0 5px; letter-spacing: 1px; }
          .brand-tagline { font-size: 14px; opacity: 0.9; margin: 0; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2d5a27; margin-bottom: 15px; }
          .message { color: #666; margin-bottom: 30px; font-size: 15px; }
          .otp-section {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border: 2px solid #4a7c43;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
          }
          .otp-label { font-size: 14px; color: #666; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
          .otp-code { font-size: 42px; font-weight: 700; color: #2d5a27; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0; }
          .otp-expire { font-size: 13px; color: #888; margin-top: 15px; }
          .otp-expire strong { color: #e74c3c; }
          .welcome-box {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 12px 12px 0;
          }
          .welcome-box h3 { margin: 0 0 10px; color: #1565c0; font-size: 16px; }
          .welcome-box ul { margin: 0; padding-left: 20px; color: #1976d2; }
          .welcome-box li { margin: 5px 0; font-size: 14px; }
          .warning { 
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .warning p { margin: 0; color: #e65100; font-size: 14px; }
          .footer { 
            background: #f9f9f9;
            text-align: center; 
            padding: 25px 30px; 
            border-top: 1px solid #eee;
          }
          .footer-logo { font-size: 24px; margin-bottom: 10px; }
          .footer-text { color: #999; font-size: 12px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <span class="logo-icon">�</span>
              </div>
              <h1 class="brand-name">FLORÉN</h1>
              <p class="brand-tagline">Chào mừng bạn đến với gia đình chúng tôi!</p>
            </div>
            <div class="content">
              <p class="greeting">Xin chào <strong>${userName}</strong> 👋</p>
              <p class="message">
                Cảm ơn bạn đã đăng ký tài khoản tại FLORÉN! 
                Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác minh bên dưới:
              </p>
              
              <div class="otp-section">
                <p class="otp-label">Mã xác minh email</p>
                <div class="otp-code">${otp}</div>
                <p class="otp-expire">Mã có hiệu lực trong <strong>10 phút</strong></p>
              </div>
              
              <div class="welcome-box">
                <h3>🎉 Khi trở thành thành viên, bạn sẽ nhận được:</h3>
                <ul>
                  <li>Ưu đãi độc quyền dành riêng cho thành viên</li>
                  <li>Tích điểm đổi quà hấp dẫn</li>
                  <li>Cập nhật sản phẩm mới & khuyến mãi</li>
                  <li>Hỗ trợ tư vấn chăm sóc cây 24/7</li>
                </ul>
              </div>
              
              <div class="warning">
                <p>⚠️ Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email và không chia sẻ mã xác minh với bất kỳ ai.</p>
              </div>
            </div>
            <div class="footer">
              <div class="footer-logo">�🌱🍃</div>
              <p class="footer-text"><strong>FLORÉN</strong></p>
              <p class="footer-text">Mang thiên nhiên vào ngôi nhà của bạn</p>
              <p class="footer-text" style="margin-top: 15px;">© 2024 FLORÉN. All rights reserved.</p>
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

// Temporary storage for pending registrations (in production, use Redis or database)
const pendingRegistrations = new Map();

// Note: SMS functionality requires a service like Twilio, currently simulated
const sendOTPSMS = async (phoneNumber, otp) => {
  // In production, integrate with Twilio or similar SMS service
  console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
  // For now, return success to simulate SMS sending
  return { success: true, message: 'SMS sent (simulated)' };
};

// Password strength validation
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  if (!/[A-Z]/.test(password)) errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  if (!/[a-z]/.test(password)) errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  if (!/[0-9]/.test(password)) errors.push('Mật khẩu phải có ít nhất 1 chữ số');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  return errors;
};

// Register - Simple registration without OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    
    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: passwordErrors[0] });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã được sử dụng' });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Create user directly
    const user = new User({
      name,
      email,
      password: hash,
      phoneNumber: phone || ''
    });
    await user.save();
    
    res.status(201).json({ message: 'Đăng ký thành công!' });
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
        role: user.role,
        createdAt: user.createdAt,
        isLocked: user.isLocked
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google Login/Register
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - check if locked
      if (user.isLocked) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.' });
      }

      // Update Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      }
    } else {
      // Create new user with Google
      user = new User({
        name,
        email,
        googleId,
        avatar: picture || '',
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Random password for Google users
        phoneNumber: ''
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
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
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Xác thực Google thất bại. Vui lòng thử lại.' });
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
