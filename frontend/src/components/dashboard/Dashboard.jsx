import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, Plus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDateRelative, getMonthName, getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';
import LoadingSpinner, { ChartSkeleton, CardSkeleton } from '../common/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetOverview, setBudgetOverview] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState(null);

  const api = useApi();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentTransactions(),
        fetchBudgetOverview(),
        fetchMonthlyData(),
        fetchCategoryData()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/transactions/stats');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await api.get('/transactions', { limit: 5 });
      if (response.success) {
        setRecentTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchBudgetOverview = async () => {
    try {
      setLoadingBudgets(true);
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      
      const response = await api.get('/budgets/overview', {
        month: currentMonth,
        year: currentYear
      });
      
      if (response.success) {
        setBudgetOverview(response.overview);
      }
    } catch (error) {
      console.error('Error fetching budget overview:', error);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoadingCharts(true);
      const currentYear = getCurrentYear();
      const monthlyPromises = [];

      // Fetch data for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        monthlyPromises.push(
          api.get('/transactions/stats', {
            startDate: new Date(year, month - 1, 1).toISOString(),
            endDate: new Date(year, month, 0, 23, 59, 59).toISOString()
          })
        );
      }

      const monthlyResults = await Promise.all(monthlyPromises);
      const chartData = monthlyResults.map((result, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        
        return {
          month: getMonthName(date.getMonth(), true),
          income: result.success ? (result.stats?.income || 0) : 0,
          expenses: result.success ? (result.stats?.expense || 0) : 0
        };
      });

      setMonthlyData(chartData);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      
      const response = await api.get('/transactions/stats', {
        startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
        endDate: new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString()
      });

      if (response.success && response.stats?.categoryBreakdown) {
        const chartData = response.stats.categoryBreakdown
          .slice(0, 8) // Limit to top 8 categories
          .map((item, index) => ({
            name: item._id,
            value: item.total,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }));
        
        setCategoryData(chartData);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const calculateTrends = () => {
    if (monthlyData.length < 2) return {};

    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const incomeTrend = previousMonth.income > 0 
      ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
      : 0;

    const expenseTrend = previousMonth.expenses > 0
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : 0;

    return {
      income: {
        value: `${incomeTrend >= 0 ? '+' : ''}${incomeTrend.toFixed(1)}%`,
        direction: incomeTrend >= 0 ? 'up' : 'down'
      },
      expense: {
        value: `${expenseTrend >= 0 ? '+' : ''}${Math.abs(expenseTrend).toFixed(1)}%`,
        direction: expenseTrend <= 0 ? 'up' : 'down' // Inverse for expenses (lower is better)
      }
    };
  };

  const trends = calculateTrends();

  const handleAddTransaction = () => {
    window.location.hash = '/transactions?action=add';
  };

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's your financial overview for {getMonthName(getCurrentMonth() - 1)} {getCurrentYear()}
          </p>
        </motion.div>
        
        <motion.button
          onClick={handleAddTransaction}
          className="btn-primary flex items-center mt-4 sm:mt-0"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} className="mr-2" />
          Add Transaction
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatsCard
              title="Total Balance"
              value={formatCurrency(stats?.balance || 0)}
              icon={DollarSign}
              color="blue"
              trend={stats?.balance >= 0 ? 'up' : 'down'}
              trendValue={`${formatCurrency(Math.abs(stats?.balance || 0))}`}
              delay={0}
            />
            <StatsCard
              title="This Month's Income"
              value={formatCurrency(stats?.income || 0)}
              icon={TrendingUp}
              color="green"
              trend={trends.income?.direction || 'up'}
              trendValue={trends.income?.value || '0%'}
              delay={0.1}
            />
            <StatsCard
              title="This Month's Expenses"
              value={formatCurrency(stats?.expense || 0)}
              icon={TrendingDown}
              color="red"
              trend={trends.expense?.direction || 'down'}
              trendValue={trends.expense?.value || '0%'}
              delay={0.2}
            />
            <StatsCard
              title="Budget Usage"
              value={
                budgetOverview && budgetOverview.totalBudgeted > 0
                  ? `${((budgetOverview.totalSpent / budgetOverview.totalBudgeted) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={Target}
              color="purple"
              trend={
                budgetOverview && budgetOverview.totalSpent > budgetOverview.totalBudgeted
                  ? 'down'
                  : 'up'
              }
              trendValue={
                budgetOverview
                  ? `${budgetOverview.overBudgetCount} over budget`
                  : 'No budgets'
              }
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div
          className="card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">6-Month Trend</h3>
            <Link
              to="/reports"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Reports
            </Link>
          </div>
          
          {loadingCharts ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : monthlyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No data available for chart</p>
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          className="card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Expense Categories
            </h3>
            <Link
              to="/transactions?type=expense"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          {loadingCharts ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : categoryData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 truncate">
                      {item.name} ({formatCurrency(item.value)})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No expense data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div
          className="lg:col-span-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {loadingTransactions ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RecentTransactions 
              transactions={recentTransactions} 
              onRefresh={fetchRecentTransactions}
            />
          )}
        </motion.div>

        {/* Quick Actions & Budget Summary */}
        <motion.div
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/transactions?action=add&type=income"
                className="flex items-center w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-green-700">Add Income</p>
                  <p className="text-sm text-gray-500">Record new income</p>
                </div>
              </Link>
              
              <Link
                to="/transactions?action=add&type=expense"
                className="flex items-center w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-red-700">Add Expense</p>
                  <p className="text-sm text-gray-500">Record new expense</p>
                </div>
              </Link>
              
              <Link
                to="/budgets?action=create"
                className="flex items-center w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700">Create Budget</p>
                  <p className="text-sm text-gray-500">Set spending goals</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Budget Summary</h3>
              <Link
                to="/budgets"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
            
            {loadingBudgets ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2" />
                  </div>
                ))}
              </div>
            ) : budgetOverview && budgetOverview.categories && budgetOverview.categories.length > 0 ? (
              <div className="space-y-4">
                {budgetOverview.categories.slice(0, 5).map((budget, index) => {
                  const percentage = budget.budgeted > 0 
                    ? Math.min((budget.spent / budget.budgeted) * 100, 100) 
                    : 0;
                  const isOverBudget = budget.spent > budget.budgeted;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {budget.category}
                        </span>
                        <span className={`text-sm font-medium ${
                          isOverBudget ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget 
                              ? 'bg-red-500' 
                              : percentage > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{percentage.toFixed(0)}% used</span>
                        <span>
                          {budget.remaining >= 0 
                            ? `${formatCurrency(budget.remaining)} left`
                            : `${formatCurrency(Math.abs(budget.remaining))} over`
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(budgetOverview.totalSpent)} / {formatCurrency(budgetOverview.totalBudgeted)}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetOverview.totalSpent > budgetOverview.totalBudgeted
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((budgetOverview.totalSpent / budgetOverview.totalBudgeted) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-3">No budgets created yet</p>
                <Link
                  to="/budgets?action=create"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create your first budget
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Refresh Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center"
          disabled={loadingStats || loadingTransactions || loadingBudgets}
        >
          {loadingStats || loadingTransactions || loadingBudgets ? (
            <LoadingSpinner size="small" color="gray" />
          ) : (
            'Refresh Data'
          )}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;