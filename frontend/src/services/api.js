class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 401) {
          this.setToken(null);
          window.location.hash = '/login';
          throw new Error('Authentication required');
        }

        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // Transaction endpoints
  async getTransactions(params = {}) {
    return this.get('/transactions', params);
  }

  async createTransaction(transactionData) {
    return this.post('/transactions', transactionData);
  }

  async updateTransaction(id, transactionData) {
    return this.put(`/transactions/${id}`, transactionData);
  }

  async deleteTransaction(id) {
    return this.delete(`/transactions/${id}`);
  }

  async getTransactionStats(params = {}) {
    return this.get('/transactions/stats', params);
  }

  // Budget endpoints
  async getBudgets(params = {}) {
    return this.get('/budgets', params);
  }

  async createBudget(budgetData) {
    return this.post('/budgets', budgetData);
  }

  async updateBudget(id, budgetData) {
    return this.put(`/budgets/${id}`, budgetData);
  }

  async deleteBudget(id) {
    return this.delete(`/budgets/${id}`);
  }

  async getBudgetOverview(params = {}) {
    return this.get('/budgets/overview', params);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;