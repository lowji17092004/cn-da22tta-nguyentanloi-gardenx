// Email service for sending notifications
const nodemailer = require('nodemailer');

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
    html: generateOTPEmailTemplate(otp, userName)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send Verification Email
const sendVerificationEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"FLORÉN" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
    to: email,
    subject: '🌿 Xác minh email đăng ký - FLORÉN',
    html: generateVerificationEmailTemplate(otp, userName)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email template for OTP
const generateOTPEmailTemplate = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 50%, #6b9d64 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 5px; letter-spacing: 1px;">FLORÉN</h1>
            <p style="font-size: 14px; opacity: 0.9; margin: 0;">Mang thiên nhiên vào ngôi nhà của bạn</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #2d5a27; margin-bottom: 15px;">Xin chào <strong>${userName}</strong> 👋</p>
            <p style="color: #666; margin-bottom: 30px; font-size: 15px;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FLORÉN. 
              Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
            </p>
            <div style="background: linear-gradient(135deg, #f8fdf7 0%, #e8f5e6 100%); border: 2px solid #4a7c43; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Mã xác thực của bạn</p>
              <div style="font-size: 42px; font-weight: 700; color: #2d5a27; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">${otp}</div>
              <p style="font-size: 13px; color: #888; margin-top: 15px;">Mã có hiệu lực trong <strong style="color: #e74c3c;">10 phút</strong></p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for verification
const generateVerificationEmailTemplate = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 50%, #6b9d64 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 5px; letter-spacing: 1px;">FLORÉN</h1>
            <p style="font-size: 14px; opacity: 0.9; margin: 0;">Chào mừng bạn đến với gia đình chúng tôi!</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #2d5a27; margin-bottom: 15px;">Xin chào <strong>${userName}</strong> 👋</p>
            <p style="color: #666; margin-bottom: 30px; font-size: 15px;">
              Cảm ơn bạn đã đăng ký tài khoản tại FLORÉN! 
              Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác minh bên dưới:
            </p>
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4a7c43; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Mã xác minh email</p>
              <div style="font-size: 42px; font-weight: 700; color: #2d5a27; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">${otp}</div>
              <p style="font-size: 13px; color: #888; margin-top: 15px;">Mã có hiệu lực trong <strong style="color: #e74c3c;">10 phút</strong></p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  transporter,
  generateOTP,
  sendOTPEmail,
  sendVerificationEmail
};
