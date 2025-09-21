import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main app components
import Dashboard from './components/dashboard/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import BudgetList from './components/budget/BudgetList';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route wrapper (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Google OAuth Success handler
const GoogleAuthSuccess = () => {
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      window.location.hash = '/dashboard';
      window.location.reload();
    } else {
      window.location.hash = '/login?error=auth_failed';
    }
  }, []);

  return <LoadingSpinner fullScreen text="Completing authentication..." />;
};

// Error page component
const ErrorPage = ({ error = "Page not found" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.hash = '/dashboard'}
          className="btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

// Main App Router
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Google OAuth callback */}
        <Route path="/auth/success" element={<GoogleAuthSuccess />} />
        <Route 
          path="/auth/error" 
          element={<ErrorPage error="Authentication failed. Please try again." />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <Layout>
                <TransactionList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/budgets" 
          element={
            <ProtectedRoute>
              <Layout>
                <BudgetList />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Reports placeholder */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
                  <p className="text-gray-600 mb-4">Advanced reporting features coming soon!</p>
                  <button
                    onClick={() => window.location.hash = '/dashboard'}
                    className="btn-primary"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Settings placeholder */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                  <p className="text-gray-600 mb-4">User settings coming soon!</p>
                  <button
                    onClick={() => window.location.hash = '/dashboard'}
                    className="btn-primary"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 handler */}
        <Route 
          path="*" 
          element={<ErrorPage error="The page you're looking for doesn't exist." />} 
        />
      </Routes>
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
        
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },

            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                color: '#166534',
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#f0fdf4',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#fef2f2',
                borderColor: '#fecaca',
                color: '#991b1b',
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fef2f2',
              },
            },
            loading: {
              duration: Infinity,
            },
          }}
        />
      </div>
    </AuthProvider>
  );
};

export default App;