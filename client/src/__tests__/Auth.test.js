import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import Login from '../components/Auth/Login';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { BrowserRouter } from 'react-router-dom';
import authService from '../services/authService';

// Mock authService
jest.mock('../services/authService');
const mockedAuthService = authService;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' })
}));

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Component', () => {
    it('should render login form', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/имя пользователя/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('should validate form fields', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /войти/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/введите имя пользователя/i)).toBeInTheDocument();
      });
    });

    it('should handle successful login', async () => {
      const mockLoginResponse = {
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'admin',
            permissions: ['*']
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      mockedAuthService.login.mockResolvedValue(mockLoginResponse);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/имя пользователя/i), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText(/пароль/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });

    it('should handle login error', async () => {
      mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/имя пользователя/i), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText(/пароль/i), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should toggle password visibility', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/пароль/i);
      const toggleButton = screen.getByRole('button', { name: /показать пароль/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('AuthProvider', () => {
    it('should provide authentication context', () => {
      let contextValue;

      const TestComponent = () => {
        contextValue = React.useContext(AuthContext);
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(contextValue).toHaveProperty('user');
      expect(contextValue).toHaveProperty('isAuthenticated');
      expect(contextValue).toHaveProperty('login');
      expect(contextValue).toHaveProperty('logout');
    });

    it('should check auth status on mount', async () => {
      // Mock localStorage with token
      localStorage.setItem('access_token', 'mock-token');
      
      mockedAuthService.verifyToken.mockResolvedValue({
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin',
          permissions: ['*']
        }
      });

      let contextValue;

      const TestComponent = () => {
        contextValue = React.useContext(AuthContext);
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue.isAuthenticated).toBe(true);
        expect(contextValue.user.username).toBe('testuser');
      });
    });

    it('should handle logout', () => {
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

      let contextValue;

      const TestComponent = () => {
        contextValue = React.useContext(AuthContext);
        return (
          <button onClick={contextValue.logout}>
            Logout
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Logout'));

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(contextValue.isAuthenticated).toBe(false);
    });
  });

  describe('ProtectedRoute', () => {
    it('should redirect to login when not authenticated', () => {
      const TestComponent = () => <div>Protected Content</div>;

      const authContextValue = {
        user: null,
        isAuthenticated: false,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshAccessToken: jest.fn(),
        checkPermission: jest.fn(),
        hasRole: jest.fn(),
        checkAuthStatus: jest.fn()
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
      const TestComponent = () => <div>Protected Content</div>;

      const authContextValue = {
        user: { id: 1, username: 'testuser', permissions: ['*'] },
        isAuthenticated: true,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshAccessToken: jest.fn(),
        checkPermission: jest.fn(() => true),
        hasRole: jest.fn(() => true),
        checkAuthStatus: jest.fn()
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show access denied when lacking permissions', () => {
      const TestComponent = () => <div>Protected Content</div>;

      const authContextValue = {
        user: { id: 1, username: 'testuser', permissions: ['read'] },
        isAuthenticated: true,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshAccessToken: jest.fn(),
        checkPermission: jest.fn(() => false),
        hasRole: jest.fn(() => false),
        checkAuthStatus: jest.fn()
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute requiredPermission="admin">
              <TestComponent />
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText(/доступ запрещен/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show loading state', () => {
      const TestComponent = () => <div>Protected Content</div>;

      const authContextValue = {
        user: null,
        isAuthenticated: false,
        loading: true,
        login: jest.fn(),
        logout: jest.fn(),
        refreshAccessToken: jest.fn(),
        checkPermission: jest.fn(),
        hasRole: jest.fn(),
        checkAuthStatus: jest.fn()
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });
});