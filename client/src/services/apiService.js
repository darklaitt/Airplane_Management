import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
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

// Response interceptor for global error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Directly return response data to simplify usage
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401 Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = response.data.data.accessToken;
        
        // Update token in localStorage
        localStorage.setItem('access_token', newAccessToken);
        
        // Update header and retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Extract error message from response
    let errorMessage = 'Произошла ошибка при обработке запроса';
    
    if (error.response) {
      // The server responded with an error status
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    // Create a standardized error object
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

export default api;