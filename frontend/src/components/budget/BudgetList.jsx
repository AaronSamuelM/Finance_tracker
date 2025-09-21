import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import BudgetForm from './BudgetForm';
import BudgetProgress from './BudgetProgress';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [overview, setOverview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const api = useApi();
  const { loading } = api;

  useEffect(() => {
    fetchBudgets();
    fetchOverview();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      const response = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (response.success) {
        setBudgets(response.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await api.get(`/budgets/overview?month=${selectedMonth}&year=${selectedYear}`);
      if (response.success) {
        setOverview(response.overview);
      }
    } catch (error) {
      console.error('Error fetching budget overview:', error);
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${budgetId}`);
        fetchBudgets();
        fetchOverview();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const submitData = {
        ...formData,
        month: selectedMonth,
        year: selectedYear,
      };

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, submitData);
      } else {
        await api.post('/budgets', submitData);
      }
      
      setShowForm(false);
      setEditingBudget(null);
      fetchBudgets();
      fetchOverview();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Budgets
        </motion.h1>
        
        <div className="flex items-center space-x-3">
          {/* Month/Year Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input-field text-sm"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field text-sm"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <motion.button
            onClick={handleAddBudget}
            className="btn-primary flex items-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} className="mr-2" />
            Add Budget
          </motion.button>
        </div>
      </div>

      {/* Budget Overview */}
      {overview && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.totalBudgeted)}
                </p>
                <p className="text-sm text-gray-500">Total Budgeted</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.totalSpent)}
                </p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {overview.budgetCount}
                </p>
                <p className="text-sm text-gray-500">Active Budgets</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {overview.overBudgetCount}
                </p>
                <p className="text-sm text-gray-500">Over Budget</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Budget List */}
      <motion.div
        className="card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <LoadingSpinner />
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first budget to start tracking your spending goals for {months[selectedMonth - 1]} {selectedYear}.
            </p>
            <button onClick={handleAddBudget} className="btn-primary">
              Create Budget
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {months[selectedMonth - 1]} {selectedYear} Budgets
            </h3>
            
            <AnimatePresence>
              {budgets.map((budget, index) => (
                <BudgetProgress
                  key={budget._id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Budget Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
        size="medium"
      >
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default BudgetList;