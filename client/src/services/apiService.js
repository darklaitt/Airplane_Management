import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Таймаут 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логируем запросы в development режиме
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и автоматического обновления токена
api.interceptors.response.use(
  (response) => {
    // Логируем успешные ответы в development режиме
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    
    // Возвращаем только данные ответа
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Логируем ошибки
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
    
    // Если получили 401 (Unauthorized) и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Пытаемся обновить токен
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          // Обновляем токен в localStorage
          localStorage.setItem('access_token', accessToken);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление токена не удалось, очищаем localStorage и перенаправляем на login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Перенаправляем на страницу входа
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с ошибкой
      const errorMessage = error.response.data?.message || 'Произошла ошибка на сервере';
      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      customError.data = error.response.data;
      throw customError;
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      throw new Error('Нет ответа от сервера. Проверьте подключение к интернету.');
    } else {
      // Что-то пошло не так при настройке запроса
      throw new Error('Ошибка при выполнении запроса');
    }
  }
);

// Функции для работы с состоянием загрузки
let loadingCounter = 0;
const loadingListeners = new Set();

export const addLoadingListener = (callback) => {
  loadingListeners.add(callback);
};

export const removeLoadingListener = (callback) => {
  loadingListeners.delete(callback);
};

const notifyLoadingListeners = (isLoading) => {
  loadingListeners.forEach(callback => callback(isLoading));
};

// Добавляем счетчик загрузки
api.interceptors.request.use(
  (config) => {
    loadingCounter++;
    if (loadingCounter === 1) {
      notifyLoadingListeners(true);
    }
    return config;
  }
);

api.interceptors.response.use(
  (response) => {
    loadingCounter = Math.max(0, loadingCounter - 1);
    if (loadingCounter === 0) {
      notifyLoadingListeners(false);
    }
    return response;
  },
  (error) => {
    loadingCounter = Math.max(0, loadingCounter - 1);
    if (loadingCounter === 0) {
      notifyLoadingListeners(false);
    }
    return Promise.reject(error);
  }
);

// Функция для проверки статуса API
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

export default api;