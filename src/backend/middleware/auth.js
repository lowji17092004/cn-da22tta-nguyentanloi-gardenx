const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // Đảm bảo userId được set đúng
    req.user = {
      userId: payload.id,
      id: payload.id,
      role: payload.role
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};
