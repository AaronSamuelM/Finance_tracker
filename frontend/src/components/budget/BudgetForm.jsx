import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Tag, Calendar } from 'lucide-react';
import { EXPENSE_CATEGORIES, BUDGET_PERIODS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

const BudgetForm = ({ budget, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period,
      });
    }
  }, [budget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
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
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            {EXPENSE_CATEGORIES.map(category => (
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

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Budget Amount
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

      {/* Period */}
      <div>
        <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
          Period
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="period"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="input-field pl-10"
          >
            {Object.entries(BUDGET_PERIODS).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
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
            <span>{budget ? 'Update' : 'Create'} Budget</span>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default BudgetForm;