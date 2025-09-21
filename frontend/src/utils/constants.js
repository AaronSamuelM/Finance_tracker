// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Income categories
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental Income',
  'Side Hustle',
  'Gifts',
  'Refunds',
  'Bonuses',
  'Commission',
  'Dividends',
  'Interest',
  'Other Income'
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Home & Garden',
  'Insurance',
  'Taxes',
  'Personal Care',
  'Gifts & Donations',
  'Business Expenses',
  'Subscriptions',
  'Phone',
  'Internet',
  'Groceries',
  'Gas',
  'Rent/Mortgage',
  'Car Payment',
  'Credit Cards',
  'Loans',
  'Savings',
  'Investments',
  'Emergency Fund',
  'Miscellaneous',
  'Other'
];

// Budget periods
export const BUDGET_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// Chart colors for data visualization
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#EAB308'  // Amber
];

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ', name: 'New Zealand Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R', name: 'Brazilian Real' }
];

// Date ranges for filtering
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// Status constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    STATS: '/transactions/stats',
    EXPORT: '/transactions/export'
  },
  BUDGETS: {
    BASE: '/budgets',
    OVERVIEW: '/budgets/overview'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  CURRENCY: 'currency',
  LANGUAGE: 'language'
};

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/csv',
    'application/pdf'
  ]
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100
};

// Budget alert thresholds
export const BUDGET_ALERTS = {
  WARNING_THRESHOLD: 80, // 80% of budget used
  DANGER_THRESHOLD: 100  // 100% of budget used
};

// Transaction amount limits
export const AMOUNT_LIMITS = {
  MIN: 0.01,
  MAX: 1000000
};

// Regular expressions for validation
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_DATE: 'Please enter a valid date',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully!',
  LOGOUT: 'Logged out successfully!',
  REGISTER: 'Account created successfully!',
  TRANSACTION_CREATED: 'Transaction added successfully!',
  TRANSACTION_UPDATED: 'Transaction updated successfully!',
  TRANSACTION_DELETED: 'Transaction deleted successfully!',
  BUDGET_CREATED: 'Budget created successfully!',
  BUDGET_UPDATED: 'Budget updated successfully!',
  BUDGET_DELETED: 'Budget deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Feature flags (for enabling/disabling features)
export const FEATURES = {
  DARK_MODE: true,
  EXPORT_DATA: true,
  MULTI_CURRENCY: true,
  BUDGET_ALERTS: true,
  RECURRING_TRANSACTIONS: false,
  CATEGORIES_CUSTOMIZATION: true,
  REPORTS: true,
  GOALS: false
};

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};