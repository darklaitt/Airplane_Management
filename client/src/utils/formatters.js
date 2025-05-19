import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr, { locale: ru });
  } catch (error) {
    return '';
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5); // HH:mm format
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  try {
    return format(new Date(dateTime), 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch (error) {
    return '';
  }
};

export const formatPrice = (price) => {
  if (price == null) return '';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatPercentage = (value) => {
  if (value == null) return '';
  return `${value.toFixed(1)}%`;
};

export const formatStops = (stops) => {
  if (!stops || !Array.isArray(stops)) return '';
  return stops.join(' → ');
};

export const getStopsCount = (stops) => {
  if (!stops || !Array.isArray(stops)) return 0;
  return Math.max(0, stops.length - 2); // Subtract origin and destination
};

export const formatFlightDuration = (departure, arrival) => {
  if (!departure || !arrival) return '';
  const dep = new Date(`2000-01-01T${departure}`);
  const arr = new Date(`2000-01-01T${arrival}`);
  const diff = arr - dep;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}ч ${minutes}м`;
};

export const getFlightStatus = (freeSeats, totalSeats) => {
  const percentage = (freeSeats / totalSeats) * 100;
  if (percentage > 50) return { status: 'Свободно', color: 'success' };
  if (percentage > 20) return { status: 'Мало мест', color: 'warning' };
  if (percentage > 0) return { status: 'Почти распродан', color: 'danger' };
  return { status: 'Распродан', color: 'danger' };
};

export const getSeatLoadPercentage = (freeSeats, totalSeats) => {
  return ((totalSeats - freeSeats) / totalSeats * 100).toFixed(1);
};