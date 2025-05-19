export const validateFlightNumber = (flightNumber) => {
  if (!flightNumber) return 'Номер рейса обязателен';
  if (!/^[A-Z0-9]{2,10}$/.test(flightNumber)) {
    return 'Номер рейса должен содержать от 2 до 10 символов (буквы и цифры)';
  }
  return null;
};

export const validateSeatsCount = (seats) => {
  const seatsNum = parseInt(seats);
  if (!seats || isNaN(seatsNum)) return 'Количество мест обязательно';
  if (seatsNum <= 0) return 'Количество мест должно быть больше 0';
  if (seatsNum > 1000) return 'Количество мест не может превышать 1000';
  return null;
};

export const validatePrice = (price) => {
  const priceNum = parseFloat(price);
  if (!price || isNaN(priceNum)) return 'Цена обязательна';
  if (priceNum <= 0) return 'Цена должна быть больше 0';
  if (priceNum > 1000000) return 'Цена слишком высокая';
  return null;
};

export const validateTime = (time) => {
  if (!time) return 'Время обязательно';
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return 'Неверный формат времени (HH:mm)';
  }
  return null;
};

export const validateDate = (date) => {
  if (!date) return 'Дата обязательна';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Неверный формат даты';
  return null;
};

export const validateStops = (stops) => {
  if (!stops || !Array.isArray(stops)) return 'Список посадок обязателен';
  if (stops.length < 2) return 'Должны быть указаны минимум пункт отправления и пункт назначения';
  for (const stop of stops) {
    if (!stop || typeof stop !== 'string' || stop.trim().length === 0) {
      return 'Все пункты должны быть заполнены';
    }
  }
  return null;
};

export const validateCounterNumber = (counter) => {
  const counterNum = parseInt(counter);
  if (!counter || isNaN(counterNum)) return 'Номер кассы обязателен';
  if (counterNum <= 0) return 'Номер кассы должен быть больше 0';
  if (counterNum > 100) return 'Номер кассы слишком большой';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} обязательно`;
  }
  return null;
};

export const validateFormData = (data, validators) => {
  const errors = {};
  for (const [field, validator] of Object.entries(validators)) {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
};