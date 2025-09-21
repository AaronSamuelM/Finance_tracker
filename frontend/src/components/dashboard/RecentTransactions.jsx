import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Minus, RefreshCw, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDateRelative } from '../../utils/formatters';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';

const RecentTransactions = ({ transactions, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Salary': '💼',
      'Freelance': '💻',
      'Business': '🏢',
      'Investments': '📈',
      'Gifts': '🎁',
      'Other': '📝'
    };

    return iconMap[category] || '💰';
  };

  const getTransactionTypeColor = (type) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-600' 
      : 'bg-red-100 text-red-600';
  };

  const getTransactionTextColor = (type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw 
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
        
        <Link
          to="/transactions"
          className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {refreshing ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      ) : transactions.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h4>
          <p className="text-gray-500 mb-4">
            Start tracking your finances by adding your first transaction
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/transactions?action=add&type=income"
              className="btn-primary flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Link>
            <Link
              to="/transactions?action=add&type=expense"
              className="btn-secondary flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                window.location.hash = `/transactions?highlight=${transaction._id}`;
              }}
            >
              <div className="flex items-center flex-1 min-w-0">
                {/* Transaction Type Icon */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${getTransactionTypeColor(transaction.type)}
                  `}
                >
                  {transaction.type === 'income' ? (
                    <Plus className="w-6 h-6" />
                  ) : (
                    <Minus className="w-6 h-6" />
                  )}
                </div>

                {/* Transaction Details */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <span className="text-sm mr-2">
                          {getCategoryIcon(transaction.category)}
                        </span>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <span className="px-2 py-1 bg-white rounded-full text-xs font-medium border border-gray-200">
                          {transaction.category}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                          {formatDateRelative(transaction.date)}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Amount */}
                    <div className="ml-4 text-right flex-shrink-0">
                      <p
                        className={`font-bold text-lg ${getTransactionTextColor(transaction.type)}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      
                      {/* Transaction ID for reference (shown on hover) */}
                      <p className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        #{transaction._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}

          {/* Summary Row */}
          {transactions.length > 0 && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: transactions.length * 0.1 + 0.2 }}
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {transactions.length} recent transaction{transactions.length === 1 ? '' : 's'}
                </span>
                
                <div className="flex items-center space-x-4">
                  {(() => {
                    const income = transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    const expenses = transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    return (
                      <>
                        {income > 0 && (
                          <span className="text-green-600 font-medium">
                            +{formatCurrency(income)}
                          </span>
                        )}
                        {expenses > 0 && (
                          <span className="text-red-600 font-medium">
                            -{formatCurrency(expenses)}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Add Transaction */}
          <motion.div
            className="mt-4 pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex space-x-3">
              <Link
                to="/transactions?action=add&type=income"
                className="flex-1 py-2 px-3 text-center text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                + Add Income
              </Link>
              <Link
                to="/transactions?action=add&type=expense"
                className="flex-1 py-2 px-3 text-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                - Add Expense
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;