const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Access denied. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Access denied. Token expired.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Access denied. Invalid token.',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw tokenError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication.',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

module.exports = auth;
