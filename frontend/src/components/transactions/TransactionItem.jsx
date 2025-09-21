import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency, formatDateRelative } from '../../utils/formatters';

const TransactionItem = ({ transaction, onEdit, onDelete, delay = 0 }) => {
  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center flex-1">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${transaction.type === 'income' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
            }
          `}
        >
          {transaction.type === 'income' ? (
            <Plus className="w-6 h-6" />
          ) : (
            <Minus className="w-6 h-6" />
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 truncate">
              {transaction.description}
            </h4>
            <p
              className={`
                font-bold text-lg
                ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                {transaction.category}
              </span>
              <span>{formatDateRelative(transaction.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                onClick={() => onEdit(transaction)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit2 className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                onClick={() => onDelete(transaction._id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionItem;