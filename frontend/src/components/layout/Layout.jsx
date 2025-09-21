import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronDown,
  DollarSign,
  LayoutDashboard, 
  Receipt, 
  Target, 
  PieChart, 
  HelpCircle,
  ChevronRight,
  Plus
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Overview & insights'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: Receipt,
      path: '/transactions',
      description: 'Income & expenses'
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: Target,
      path: '/budgets',
      description: 'Budget planning'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: PieChart,
      path: '/reports',
      description: 'Financial reports'
    },
  ];

  const quickActions = [
    {
      id: 'add-income',
      label: 'Add Income',
      icon: Plus,
      action: () => handleQuickAction('add-income'),
      color: 'bg-green-500'
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: Plus,
      action: () => handleQuickAction('add-expense'),
      color: 'bg-red-500'
    },
    {
      id: 'create-budget',
      label: 'Create Budget',
      icon: Target,
      action: () => handleQuickAction('create-budget'),
      color: 'bg-blue-500'
    }
  ];

  // Check authentication and load user data
  useEffect(() => {
    checkAuth();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleResize = () => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    
    if (!mobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.hash = '/login';
  };

  const handleNavigation = (path) => {
    window.location.hash = path;
    if (isMobile) setSidebarOpen(false);
    
    const item = navigationItems.find(nav => nav.path === path);
    if (item) setActiveItem(item.id);
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'add-income':
        window.location.hash = '/transactions?action=add&type=income';
        break;
      case 'add-expense':
        window.location.hash = '/transactions?action=add&type=expense';
        break;
      case 'create-budget':
        window.location.hash = '/budgets?action=create';
        break;
      default:
        console.log('Quick action:', actionId);
    }
    if (isMobile) setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const path = window.location.pathname || window.location.hash.replace('#', '');
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/transactions': return 'Transactions';
      case '/budgets': return 'Budgets';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      default: return 'Finance Tracker';
    }
  };

  // Handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = async (query) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/transactions?search=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.transactions || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Don't render layout for auth pages
  const currentPath = window.location.pathname || window.location.hash.replace('#', '');
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath);

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Loading your dashboard...</h2>
          <p className="text-gray-500">Please wait while we prepare your financial data.</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user && !loading) {
    window.location.hash = '/login';
    return null;
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  // Sidebar component
  const Sidebar = ({ isOpen }) => (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: isMobile ? "-100%" : 0 }}
        animate={{ x: (isOpen || !isMobile) ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 lg:z-30 w-64 bg-white shadow-lg lg:shadow-none lg:relative"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Finance</h1>
                <p className="text-sm text-gray-500">Tracker</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} className={`mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-primary-600" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.currency || 'USD'} Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  // Navbar component
  const Navbar = () => (
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="lg:hidden flex items-center ml-2">
              <DollarSign className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FT</span>
            </div>
            
            <h1 className="hidden lg:block text-2xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, budgets..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </span>
                <ChevronDown size={16} className="hidden md:block" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User size={16} className="mr-3" />
                        Your Profile
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings size={16} className="mr-3" />
                        Settings
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-4"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions, budgets..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside handlers */}
      {(profileDropdownOpen || notificationDropdownOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationDropdownOpen(false);
          }}
        />
      )}
    </motion.header>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-30">
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <Navbar />
        
        <motion.main
          className="flex-1 min-h-screen"
          onClick={() => isMobile && sidebarOpen && setSidebarOpen(false)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <span>&copy; 2024 Finance Tracker. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs">Version 1.0.0</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;