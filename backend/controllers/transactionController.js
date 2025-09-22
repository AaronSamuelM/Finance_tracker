const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Get all transactions for user
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 1000, type, category, startDate, endDate } = req.query;
    
    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = new Transaction({
      ...req.body,
      user: req.user.id,
    });

    await transaction.save();

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpent(req.user.id, transaction.category, transaction.amount, 'add');
    }

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;

    Object.assign(transaction, req.body);
    await transaction.save();

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      if (oldCategory === transaction.category) {
        const diff = transaction.amount - oldAmount;
        await updateBudgetSpent(req.user.id, transaction.category, Math.abs(diff), diff > 0 ? 'add' : 'subtract');
      } else {
        await updateBudgetSpent(req.user.id, oldCategory, oldAmount, 'subtract');
        await updateBudgetSpent(req.user.id, transaction.category, transaction.amount, 'add');
      }
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpent(req.user.id, transaction.category, transaction.amount, 'subtract');
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction statistics
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { user: req.user._id };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: { ...matchStage, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      categoryBreakdown: categoryStats,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.total;
    });

    result.balance = result.income - result.expense;

    res.json({
      success: true,
      stats: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update budget spent amount
const updateBudgetSpent = async (userId, category, amount, operation) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budget = await Budget.findOne({
      user: userId,
      category,
      month,
      year,
    });

    if (budget) {
      if (operation === 'add') {
        budget.spent += amount;
      } else if (operation === 'subtract') {
        budget.spent = Math.max(0, budget.spent - amount);
      }
      await budget.save();
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
};