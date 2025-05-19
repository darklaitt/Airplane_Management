// Утилиты для работы с шифрованием на клиенте

// Функция для кодирования строки в Base64
export const encodeBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Error encoding to Base64:', error);
    return null;
  }
};

// Функция для декодирования из Base64
export const decodeBase64 = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error('Error decoding from Base64:', error);
    return null;
  }
};

// Генерация случайной строки
export const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Простое XOR шифрование (НЕ для критичных данных!)
export const simpleXOREncrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return encodeBase64(result);
};

// Простое XOR расшифрование
export const simpleXORDecrypt = (encryptedText, key) => {
  const decoded = decodeBase64(encryptedText);
  if (!decoded) return null;
  
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

// Генерация хеша (простая реализация, не для безопасности)
export const simpleHash = (str) => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Преобразуем в 32-битное число
  }
  return Math.abs(hash).toString(16);
};

// Проверка сложности пароля
export const checkPasswordStrength = (password) => {
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const score = Object.values(requirements).reduce((acc, met) => acc + (met ? 1 : 0), 0);
  
  let strength = 'Очень слабый';
  if (score >= 5) strength = 'Очень сильный';
  else if (score >= 4) strength = 'Сильный';
  else if (score >= 3) strength = 'Средний';
  else if (score >= 2) strength = 'Слабый';
  
  return {
    score,
    strength,
    requirements,
    percentage: (score / 5) * 100
  };
};

// Безопасное сравнение строк (защита от timing attacks)
export const safeStringCompare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// Маскирование чувствительных данных
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars) {
    return '*'.repeat(data?.length || 0);
  }
  
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
};

// Генерация UUID v4 (простая реализация)
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Очистка чувствительных данных из памяти (символическая)
export const clearSensitiveData = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = '';
      } else if (typeof obj[key] === 'object') {
        clearSensitiveData(obj[key]);
      }
    });
  }
};

// Валидация формата email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация формата телефона (российский формат)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+7|8)?[\s-]?\(?9\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
  return phoneRegex.test(phone);
};

// Экспорт всех функций
export default {
  encodeBase64,
  decodeBase64,
  generateRandomString,
  simpleXOREncrypt,
  simpleXORDecrypt,
  simpleHash,
  checkPasswordStrength,
  safeStringCompare,
  maskSensitiveData,
  generateUUID,
  clearSensitiveData,
  isValidEmail,
  isValidPhone
};