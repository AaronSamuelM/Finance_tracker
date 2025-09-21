import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const BudgetProgress = ({ budget, onEdit, onDelete, delay = 0 }) => {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = budget.spent > budget.amount;
  const isNearLimit = percentage > 80 && !isOverBudget;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (isNearLimit) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon()}
          <h4 className="ml-2 text-lg font-semibold text-gray-900">
            {budget.category}
          </h4>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={() => onEdit(budget)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => onDelete(budget._id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Spent: {formatCurrency(budget.spent)}</span>
          <span>Budget: {formatCurrency(budget.amount)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          />
        </div>
        
        <div className="flex justify-between text-sm mt-2">
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
            {formatPercentage(budget.spent, budget.amount)} used
          </span>
          <span className={`${remaining >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
            {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>
      </div>

      {/* Status Message */}
      {isOverBudget && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      )}
      
      {isNearLimit && !isOverBudget && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ You're approaching your budget limit. {formatCurrency(remaining)} remaining.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetProgress;