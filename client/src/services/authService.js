// Простая заглушка для authService для демонстрации
// В реальном проекте здесь должны быть вызовы к вашему API

const authService = {
  login: async (username, password) => {
    // Симуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Простая проверка для демонстрации
    if (username === 'admin' && password === 'admin123') {
      return {
        data: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@airline.com',
            first_name: 'Администратор',
            last_name: 'Системы',
            role: 'admin',
            permissions: ['*']
          },
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now()
        }
      };
    } else if (username === 'manager' && password === '123456') {
      return {
        data: {
          user: {
            id: 2,
            username: 'manager',
            email: 'manager@airline.com',
            first_name: 'Менеджер',
            last_name: 'Авиакомпании',
            role: 'manager',
            permissions: ['planes:read', 'planes:write', 'flights:read', 'flights:write', 'tickets:read', 'reports:read']
          },
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now()
        }
      };
    } else {
      throw new Error('Неверное имя пользователя или пароль');
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !token.startsWith('mock-access-token') || !userData) {
      throw new Error('Invalid token');
    }
    
    return {
      data: JSON.parse(userData)
    };
  },

  refreshToken: async (refreshToken) => {
    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token')) {
      throw new Error('Invalid refresh token');
    }
    
    return {
      data: {
        accessToken: 'mock-access-token-' + Date.now()
      }
    };
  },

  register: async (userData) => {
    // Симуляция регистрации
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        id: Date.now(),
        username: userData.username,
        email: userData.email
      }
    };
  },

  logout: async () => {
    // Заглушка для выхода
    return Promise.resolve();
  },

  getCurrentUser: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No user data');
    }
    
    return {
      data: JSON.parse(userData)
    };
  },

  updateProfile: async (profileData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        message: 'Профиль обновлен',
        user: profileData
      }
    };
  },

  changePassword: async (oldPassword, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (oldPassword !== 'admin123') {
      throw new Error('Неверный старый пароль');
    }
    
    return {
      data: {
        message: 'Пароль успешно изменен'
      }
    };
  }
};

export default authService;