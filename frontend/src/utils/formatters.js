// Currency formatting
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Compact currency formatting for large numbers
export const formatCurrencyCompact = (amount, currency = 'USD') => {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return formatCurrency(amount, currency);
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);
};

// Percentage formatting
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date, format = 'default') => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formats = {
    default: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    short: { 
      year: '2-digit', 
      month: '2-digit', 
      day: '2-digit' 
    },
    'MM/dd/yyyy': null, // Special case
    'yyyy-MM-dd': null, // Special case
    time: { 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };

  // Special formatting cases
  if (format === 'MM/dd/yyyy') {
    return `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
  }

  if (format === 'yyyy-MM-dd') {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  }

  const formatOptions = formats[format] || formats.default;
  return dateObj.toLocaleDateString('en-US', formatOptions);
};

// Relative date formatting (e.g., "2 days ago", "in 3 hours")
export const formatDateRelative = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (Math.abs(diffInSeconds) < 60) {
    return 'Just now';
  } else if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 
      ? `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) === 1 ? '' : 's'}`;
  } else if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 
      ? `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInHours)} hour${Math.abs(diffInHours) === 1 ? '' : 's'}`;
  } else if (Math.abs(diffInDays) < 7) {
    return diffInDays > 0 
      ? `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'}`;
  } else if (Math.abs(diffInWeeks) < 4) {
    return diffInWeeks > 0 
      ? `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInWeeks)} week${Math.abs(diffInWeeks) === 1 ? '' : 's'}`;
  } else if (Math.abs(diffInMonths) < 12) {
    return diffInMonths > 0 
      ? `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInMonths)} month${Math.abs(diffInMonths) === 1 ? '' : 's'}`;
  } else {
    return diffInYears > 0 
      ? `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
      : `in ${Math.abs(diffInYears)} year${Math.abs(diffInYears) === 1 ? '' : 's'}`;
  }
};

// Time formatting
export const formatTime = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Text formatting utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) return text;
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// File size formatting
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Color utilities for charts and UI
export const getColorByValue = (value, thresholds = { low: 33, medium: 66 }) => {
  if (value <= thresholds.low) return 'text-red-600';
  if (value <= thresholds.medium) return 'text-yellow-600';
  return 'text-green-600';
};

export const getBgColorByValue = (value, thresholds = { low: 33, medium: 66 }) => {
  if (value <= thresholds.low) return 'bg-red-100';
  if (value <= thresholds.medium) return 'bg-yellow-100';
  return 'bg-green-100';
};

// Transaction amount formatting with +/- indicators
export const formatTransactionAmount = (amount, type) => {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${formatCurrency(Math.abs(amount))}`;
};

// Budget progress formatting
export const formatBudgetProgress = (spent, budgeted) => {
  if (budgeted === 0) return '0%';
  const percentage = (spent / budgeted) * 100;
  return Math.min(percentage, 100).toFixed(1) + '%';
};

// Month name helpers
export const getMonthName = (monthIndex, short = false) => {
  const months = short 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return months[monthIndex] || '';
};

export const getCurrentMonth = () => {
  return new Date().getMonth() + 1; // 1-indexed
};

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

// Validation helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) > 0;
};

// Array formatting helpers
export const formatList = (items, conjunction = 'and') => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
};

// URL and slug helpers
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};