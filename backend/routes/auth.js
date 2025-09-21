const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  googleSuccess,
} = require('../controllers/authController');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  login
);

// Get current user
router.get('/me', auth, getMe);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  googleSuccess
);

module.exports = router;