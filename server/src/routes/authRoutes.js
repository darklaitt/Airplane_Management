const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Простое хранилище пользователей (в памяти)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password_hash: '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    first_name: 'Администратор',
    last_name: 'Системы',
    role: 'admin',
    permissions: ['*']
  }
];

// Счетчик для ID
let userIdCounter = 2;

// Регистрация
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request:', req.body);
    
    const { username, email, password, first_name, last_name } = req.body;
    
    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя, email и пароль обязательны'
      });
    }

    // Проверяем дубликаты
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким именем или email уже существует'
      });
    }

    // Хешируем пароль
    const password_hash = await bcrypt.hash(password, 12);
    
    // Создаем пользователя
    const newUser = {
      id: userIdCounter++,
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      role: 'analyst', // По умолчанию роль analyst
      permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read']
    };

    users.push(newUser);

    console.log('✅ User registered successfully:', newUser.username);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Логин
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request:', req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя и пароль обязательны'
      });
    }

    // Ищем пользователя
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    console.log('✅ Login successful for user:', username);

    // Генерируем простые токены
    const accessToken = `token-${user.id}-${Date.now()}`;
    const refreshToken = `refresh-${user.id}-${Date.now()}`;

    // Успешный вход
    res.json({
      success: true,
      message: 'Успешный вход в систему',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          permissions: user.permissions
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Проверка токена
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token && token.startsWith('token-')) {
    const userId = parseInt(token.split('-')[1]);
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          permissions: user.permissions
        }
      });
    }
  }

  res.status(401).json({
    success: false,
    message: 'Токен недействителен'
  });
});

// Получить текущего пользователя
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token && token.startsWith('token-')) {
    const userId = parseInt(token.split('-')[1]);
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          permissions: user.permissions,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      });
    }
  }

  res.status(401).json({
    success: false,
    message: 'Требуется аутентификация'
  });
});

// Выход
router.post('/logout', (req, res) => {
  console.log('👋 Logout request');
  res.json({
    success: true,
    message: 'Успешный выход из системы'
  });
});

// Отладочный маршрут - показать всех пользователей
router.get('/debug/users', (req, res) => {
  res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      permissions: u.permissions
    }))
  });
});

module.exports = router;