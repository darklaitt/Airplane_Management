export const PLANE_CATEGORIES = [
  'Региональный',
  'Средний',
  'Дальний'
];

export const TIME_FORMATS = {
  TIME_ONLY: 'HH:mm',
  DATE_ONLY: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY_DATE: 'dd.MM.yyyy',
  DISPLAY_DATETIME: 'dd.MM.yyyy HH:mm'
};

export const ROUTES = {
  HOME: '/',
  PLANES: '/planes',
  FLIGHTS: '/flights',
  TICKETS: '/tickets',
  REPORTS: '/reports'
};

export const API_ENDPOINTS = {
  PLANES: '/planes',
  FLIGHTS: '/flights',
  TICKETS: '/tickets',
  REPORTS: '/reports'
};

export const MESSAGES = {
  SUCCESS: {
    PLANE_CREATED: 'Самолет успешно добавлен',
    PLANE_UPDATED: 'Самолет успешно обновлен',
    PLANE_DELETED: 'Самолет успешно удален',
    FLIGHT_CREATED: 'Рейс успешно добавлен',
    FLIGHT_UPDATED: 'Рейс успешно обновлен',
    FLIGHT_DELETED: 'Рейс успешно удален',
    TICKET_CREATED: 'Билет успешно продан',
    TICKET_DELETED: 'Билет успешно удален'
  },
  ERROR: {
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение',
    VALIDATION_ERROR: 'Проверьте правильность введенных данных',
    NOT_FOUND: 'Запись не найдена',
    SERVER_ERROR: 'Ошибка сервера. Попробуйте позже'
  }
};