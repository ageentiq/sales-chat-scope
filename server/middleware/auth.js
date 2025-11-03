const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (db) => {
  const userModel = new User(db);

  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      const user = await userModel.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = auth;
