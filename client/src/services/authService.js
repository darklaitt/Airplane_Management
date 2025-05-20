
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an Axios instance with default configuration
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Add request interceptor to attach authorization token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  login: async (username, password) => {
    try {
      // Make direct call to ensure no interceptors interfere with login
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      // Store tokens and user data in localStorage
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide a helpful error message based on the error
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        throw new Error(error.response.data.message || 'Ошибка входа в систему');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      } else {
        // Something happened in setting up the request
        throw new Error('Ошибка при выполнении запроса: ' + error.message);
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка регистрации');
      } else if (error.request) {
        throw new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      } else {
        throw new Error('Ошибка при выполнении запроса: ' + error.message);
      }
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken
      });
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('access_token', response.data.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка обновления токена');
      } else if (error.request) {
        throw new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      } else {
        throw new Error('Ошибка при выполнении запроса: ' + error.message);
      }
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await instance.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await instance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка получения данных пользователя');
      } else if (error.request) {
        throw new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      } else {
        throw new Error('Ошибка при выполнении запроса: ' + error.message);
      }
    }
  },

  verifyToken: async () => {
    try {
      const response = await instance.get('/auth/verify');
      return response.data.data;
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Clear tokens on verification failure
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }
};

export default authService; 