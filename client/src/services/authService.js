import api from './apiService';

const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка входа');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка регистрации');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка обновления токена');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Токен недействителен');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки при выходе
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка получения данных пользователя');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка обновления профиля');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Ошибка изменения пароля');
      }
      throw new Error('Ошибка сети. Проверьте подключение');
    }
  }
};

export default authService;