const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Get all budgets for user
exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    
    const query = { 
      user: req.user.id,
      month: month || now.getMonth() + 1,
      year: year || now.getFullYear(),
    };

    const budgets = await Budget.find(query).sort({ category: 1 });

    res.json({
      success: true,
      budgets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create budget
exports.createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const now = new Date();
    const { category, amount, period = 'monthly' } = req.body;
    const month = req.body.month || now.getMonth() + 1;
    const year = req.body.year || now.getFullYear();

    // Calculate spent amount for this category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spentResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          category,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = spentResult.length > 0 ? spentResult[0].total : 0;

    const budget = new Budget({
      user: req.user.id,
      category,
      amount,
      period,
      month,
      year,
      spent,
    });

    await budget.save();

    res.status(201).json({
      success: true,
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Budget for this category and period already exists' 
      });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    Object.assign(budget, req.body);
    await budget.save();

    res.json({
      success: true,
      budget,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget overview
exports.getBudgetOverview = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;
    const year = req.query.year || now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    const overview = {
      totalBudgeted: 0,
      totalSpent: 0,
      budgetCount: budgets.length,
      overBudgetCount: 0,
      categories: [],
    };

    budgets.forEach((budget) => {
      overview.totalBudgeted += budget.amount;
      overview.totalSpent += budget.spent;
      
      if (budget.spent > budget.amount) {
        overview.overBudgetCount++;
      }

      overview.categories.push({
        category: budget.category,
        budgeted: budget.amount,
        spent: budget.spent,
        remaining: budget.amount - budget.spent,
        percentage: budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0,
      });
    });

    res.json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getBudgetAlerts = async (req, res) => {
  try {
    const now = new Date();
    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const alerts = budgets.filter(budget => 
      budget.spent > budget.amount * 0.8 // Alert at 80% of budget
    );

    res.json({
      success: true,
      alerts: alerts.map(budget => ({
        category: budget.category,
        spent: budget.spent,
        amount: budget.amount,
        percentage: (budget.spent / budget.amount) * 100
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};