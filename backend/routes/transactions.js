const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
} = require('../controllers/transactionController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all transactions for user
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  ],
  getTransactions
);

// Get transaction statistics
router.get(
  '/stats',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  ],
  getStats
);

// Create new transaction
router.post(
  '/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number greater than 0'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid ISO date'),
  ],
  createTransaction
);

// Update transaction
router.put(
  '/:id',
  [
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number greater than 0'),
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO date'),
  ],
  updateTransaction
);

// Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;