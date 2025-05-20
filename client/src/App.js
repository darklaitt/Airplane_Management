import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';

// Layout components
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Planes from './pages/Planes';
import Flights from './pages/Flights';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';
import ErrorPage from './pages/ErrorPage';

// Auth components
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Styles
import './App.css';
import './styles/auth.css';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Role-based protected routes */}
            <Route path="/planes" element={
              <ProtectedRoute requiredPermission="planes:read">
                <Layout>
                  <Planes />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/flights" element={
              <ProtectedRoute requiredPermission="flights:read">
                <Layout>
                  <Flights />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/tickets" element={
              <ProtectedRoute requiredPermission="tickets:read">
                <Layout>
                  <Tickets />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="reports:read">
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Error page */}
            <Route path="/error" element={<ErrorPage />} />
            
            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;