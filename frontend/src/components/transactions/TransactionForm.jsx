import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

const TransactionForm = ({ transaction, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: formatDate(new Date(), 'yyyy-MM-dd'),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: formatDate(new Date(transaction.date), 'yyyy-MM-dd'),
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' && { category: '' }),
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };
    
    onSubmit(submitData);
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
            <motion.label
              key={key}
              className={`
                relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                ${formData.type === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={formData.type === value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="font-medium capitalize">{value}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            className={`
              input-field pl-10
              ${errors.amount ? 'border-red-300 focus:ring-red-500' : ''}
            `}
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`
              input-field pl-10
              ${errors.category ? 'border-red-300 focus:ring-red-500' : ''}
            `}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`
              input-field pl-10 resize-none
              ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}
            `}
            placeholder="Enter transaction description..."
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className={`
              input-field pl-10
              ${errors.date ? 'border-red-300 focus:ring-red-500' : ''}
            `}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
        
        <motion.button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            <span>{transaction ? 'Update' : 'Add'} Transaction</span>
          )}
        </motion.button>
      </div>
    </form>
  );
};