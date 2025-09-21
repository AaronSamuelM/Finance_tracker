import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/formatters';
import TransactionForm from './TransactionForm';
import TransactionItem from './TransactionItem';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const api = useApi();
  const { loading } = api;

  useEffect(() => {
    fetchTransactions();
  }, [filters, currentPage]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await api.get(`/transactions?${params}`);
      if (response.success) {
        setTransactions(response.transactions);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${transactionId}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

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
          Transactions
        </motion.h1>
        
        <div className="flex space-x-3">
          <motion.button
            className="btn-secondary flex items-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} className="mr-2" />
            Export
          </motion.button>
          
          <motion.button
            onClick={handleAddTransaction}
            className="btn-primary flex items-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} className="mr-2" />
            Add Transaction
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          {/* Category Filter */}
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field"
          />
          
          {/* Date Range */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="input-field"
          />
          
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="input-field"
          />
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <LoadingSpinner />
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters or add a new transaction'
                : 'Get started by adding your first transaction'
              }
            </p>
            <button onClick={handleAddTransaction} className="btn-primary">
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="medium"
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default TransactionList;