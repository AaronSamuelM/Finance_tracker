const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
} = require('../controllers/budgetController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all budgets for user
router.get(
  '/',
  [
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  ],
  getBudgets
);

// Get budget overview
router.get(
  '/overview',
  [
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  ],
  getBudgetOverview
);

// Create new budget
router.post(
  '/',
  [
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number greater than 0'),
    body('period')
      .optional()
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('Period must be weekly, monthly, or yearly'),
    body('month')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    body('year')
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Year must be between 2020 and 2030'),
  ],
  createBudget
);

// Update budget
router.put(
  '/:id',
  [
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number greater than 0'),
    body('period')
      .optional()
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('Period must be weekly, monthly, or yearly'),
  ],
  updateBudget
);

// Delete budget
router.delete('/:id', deleteBudget);

module.exports = router;