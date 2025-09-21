import { useState } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const makeRequest = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      };

      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          logout();
          toast.error('Session expired. Please login again.');
          return { success: false, error: 'Unauthorized' };
        }

        if (response.status === 403) {
          toast.error('Access denied');
          return { success: false, error: 'Forbidden' };
        }

        if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
          return { success: false, error: 'Server error' };
        }

        const errorMessage = data.message || data.error || 'Request failed';
        setError(errorMessage);
        
        if (options.showToast !== false) {
          toast.error(errorMessage);
        }
        
        return { 
          success: false, 
          error: errorMessage,
          status: response.status,
          ...data 
        };
      }

      return {
        success: true,
        status: response.status,
        ...data
      };

    } catch (error) {
      console.error('API request failed:', error);
      const errorMessage = error.message || 'Network error occurred';
      setError(errorMessage);
      
      if (options.showToast !== false) {
        toast.error('Network error. Please check your connection.');
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // HTTP methods
  const get = (endpoint, options = {}) => {
    return makeRequest(endpoint, {
      method: 'GET',
      ...options
    });
  };

  const post = (endpoint, data = null, options = {}) => {
    return makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  };

  const put = (endpoint, data = null, options = {}) => {
    return makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  };

  const patch = (endpoint, data = null, options = {}) => {
    return makeRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  };

  const del = (endpoint, options = {}) => {
    return makeRequest(endpoint, {
      method: 'DELETE',
      ...options
    });
  };

  // Alias for delete (since 'delete' is a reserved word)
  const deleteRequest = del;

  // Utility methods
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    deleteRequest,
    makeRequest,
    clearError
  };
};