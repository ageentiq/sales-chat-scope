const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Initialize user model
let userModel;

module.exports = (db) => {
  // Initialize user model with db connection
  userModel = new User(db);

  // @route   POST /api/auth/register
  // @desc    Register a new user
  // @access  Public
  router.post(
    '/register',
    [
      body('email', 'Please include a valid email').isEmail(),
      body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        const user = await userModel.createUser(email, password);
        
        // Create JWT token
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        res.status(201).json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email
          }
        });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
          success: false,
          message: error.message || 'Registration failed' 
        });
      }
    }
  );

  // @route   POST /api/auth/login
  // @desc    Authenticate user & get token
  // @access  Public
  router.post(
    '/login',
    [
      body('email', 'Please include a valid email').isEmail(),
      body('password', 'Password is required').exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        const user = await userModel.validateUser(email, password);
        
        // Create JWT token
        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            email: user.email
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
    }
  );

  // @route   GET /api/auth/me
  // @desc    Get current user
  // @access  Private
  router.get('/me', async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
