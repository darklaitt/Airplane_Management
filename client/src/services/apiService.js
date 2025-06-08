// Простая заглушка для API сервиса
// В реальном проекте здесь должен быть настроенный axios instance

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Мокированные данные для демонстрации
const mockData = {
  planes: [
    { id: 1, name: 'Boeing 737-800', category: 'Средний', seats_count: 189 },
    { id: 2, name: 'Airbus A320', category: 'Средний', seats_count: 180 },
    { id: 3, name: 'Boeing 777-300', category: 'Дальний', seats_count: 368 },
    { id: 4, name: 'Airbus A380', category: 'Дальний', seats_count: 555 },
    { id: 5, name: 'Embraer E190', category: 'Региональный', seats_count: 114 }
  ],
  flights: [
    {
      id: 1,
      flight_number: 'SU1234',
      plane_name: 'Boeing 737-800',
      stops: ['Москва', 'Санкт-Петербург'],
      departure_time: '10:00:00',
      free_seats: 150,
      seats_count: 189,
      price: 8500
    },
    {
      id: 2,
      flight_number: 'S7456',
      plane_name: 'Airbus A320',
      stops: ['Москва', 'Казань', 'Уфа'],
      departure_time: '12:30:00',
      free_seats: 100,
      seats_count: 180,
      price: 12000
    },
    {
      id: 3,
      flight_number: 'AFL789',
      plane_name: 'Boeing 777-300',
      stops: ['Москва', 'Дубай'],
      departure_time: '23:45:00',
      free_seats: 280,
      seats_count: 368,
      price: 35000
    }
  ],
  tickets: [
    {
      id: 1,
      counter_number: 1,
      flight_number: 'SU1234',
      plane_name: 'Boeing 737-800',
      stops: ['Москва', 'Санкт-Петербург'],
      flight_date: '2025-06-15',
      sale_time: '2025-06-10T10:30:00Z',
      price: 8500
    },
    {
      id: 2,
      counter_number: 2,
      flight_number: 'S7456',
      plane_name: 'Airbus A320',
      stops: ['Москва', 'Казань', 'Уфа'],
      flight_date: '2025-06-16',
      sale_time: '2025-06-11T14:20:00Z',
      price: 12000
    }
  ]
};

// Создаем заглушку для axios
const api = {
  get: async (url, options = {}) => {
    console.log(`Mock API GET: ${url}`, options);
    
    // Симуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    
    // Проверка авторизации для защищенных эндпоинтов
    const token = localStorage.getItem('access_token');
    if (!token && !url.includes('/auth/')) {
      const error = new Error('Unauthorized');
      error.response = { status: 401, data: { message: 'Требуется авторизация' } };
      throw error;
    }
    
    // Маршрутизация для разных эндпоинтов
    if (url.includes('/planes')) {
      return { data: { success: true, data: mockData.planes } };
    } else if (url.includes('/flights')) {
      if (url.includes('/search/nearest')) {
        return { data: { success: true, data: mockData.flights[0] } };
      } else if (url.includes('/search/non-stop')) {
        return { data: { success: true, data: mockData.flights.filter(f => f.stops.length === 2) } };
      } else if (url.includes('/search/most-expensive')) {
        const mostExpensive = [...mockData.flights].sort((a, b) => b.price - a.price)[0];
        return { data: { success: true, data: mostExpensive } };
      }
      return { data: { success: true, data: mockData.flights } };
    } else if (url.includes('/tickets')) {
      return { data: { success: true, data: mockData.tickets } };
    } else if (url.includes('/reports/general')) {
      return { 
        data: { 
          success: true, 
          data: {
            summary: {
              totalFlights: mockData.flights.length,
              totalDirectFlights: mockData.flights.filter(f => f.stops.length === 2).length,
              flightsWithConnections: mockData.flights.filter(f => f.stops.length > 2).length,
              totalFreeSeats: mockData.flights.reduce((sum, f) => sum + f.free_seats, 0),
              totalCapacity: mockData.flights.reduce((sum, f) => sum + f.seats_count, 0),
              overallLoadPercentage: '45.5',
              averagePrice: '18500.00'
            },
            mostExpensiveFlight: [...mockData.flights].sort((a, b) => b.price - a.price)[0],
            flightsForReplacement: mockData.flights.filter(f => f.free_seats / f.seats_count > 0.5)
          }
        }
      };
    } else if (url.includes('/reports/flight-load')) {
      return {
        data: {
          success: true,
          data: mockData.flights.map(f => ({
            ...f,
            tickets_sold: Math.floor(Math.random() * 50),
            total_occupied: f.seats_count - f.free_seats,
            load_percentage: ((f.seats_count - f.free_seats) / f.seats_count * 100).toFixed(1)
          }))
        }
      };
    } else if (url.includes('/reports/sales')) {
      return {
        data: {
          success: true,
          data: {
            summary: {
              totalTickets: mockData.tickets.length,
              totalRevenue: '20500.00',
              averageTicketPrice: '10250.00'
            },
            salesByCounter: [
              { counter_number: 1, tickets_sold: 1, total_revenue: 8500 },
              { counter_number: 2, tickets_sold: 1, total_revenue: 12000 }
            ],
            salesByFlight: mockData.tickets.map(t => ({
              flight_number: t.flight_number,
              tickets_sold: 1,
              revenue: t.price
            }))
          }
        }
      };
    }
    
    return { data: { success: true, data: [] } };
  },

  post: async (url, data, options = {}) => {
    console.log(`Mock API POST: ${url}`, data, options);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    
    if (url.includes('/auth/login')) {
      // Обрабатывается в authService
      return { data: { success: true } };
    }
    
    // Для других POST запросов возвращаем успех
    const newItem = { id: Date.now(), ...data };
    
    if (url.includes('/planes')) {
      mockData.planes.push(newItem);
    } else if (url.includes('/flights')) {
      newItem.plane_name = mockData.planes.find(p => p.id === data.plane_id)?.name || 'Unknown';
      mockData.flights.push(newItem);
    } else if (url.includes('/tickets')) {
      const flight = mockData.flights.find(f => f.flight_number === data.flight_number);
      if (flight) {
        newItem.plane_name = flight.plane_name;
        newItem.stops = flight.stops;
        newItem.price = flight.price;
        mockData.tickets.push(newItem);
        // Уменьшаем количество свободных мест
        flight.free_seats = Math.max(0, flight.free_seats - 1);
      }
    }
    
    return { data: { success: true, data: newItem, message: 'Создано успешно' } };
  },

  put: async (url, data, options = {}) => {
    console.log(`Mock API PUT: ${url}`, data, options);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    
    const id = parseInt(url.split('/').pop());
    let updatedItem = { id, ...data };
    
    if (url.includes('/planes')) {
      const index = mockData.planes.findIndex(p => p.id === id);
      if (index !== -1) {
        mockData.planes[index] = updatedItem;
      }
    } else if (url.includes('/flights')) {
      const index = mockData.flights.findIndex(f => f.id === id);
      if (index !== -1) {
        updatedItem.plane_name = mockData.planes.find(p => p.id === data.plane_id)?.name || 'Unknown';
        mockData.flights[index] = updatedItem;
      }
    }
    
    return { data: { success: true, data: updatedItem, message: 'Обновлено успешно' } };
  },

  delete: async (url, options = {}) => {
    console.log(`Mock API DELETE: ${url}`, options);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    
    const id = parseInt(url.split('/').pop());
    
    if (url.includes('/planes')) {
      const index = mockData.planes.findIndex(p => p.id === id);
      if (index !== -1) {
        mockData.planes.splice(index, 1);
      }
    } else if (url.includes('/flights')) {
      const index = mockData.flights.findIndex(f => f.id === id);
      if (index !== -1) {
        mockData.flights.splice(index, 1);
      }
    } else if (url.includes('/tickets')) {
      const index = mockData.tickets.findIndex(t => t.id === id);
      if (index !== -1) {
        const ticket = mockData.tickets[index];
        // Возвращаем свободное место
        const flight = mockData.flights.find(f => f.flight_number === ticket.flight_number);
        if (flight) {
          flight.free_seats += 1;
        }
        mockData.tickets.splice(index, 1);
      }
    }
    
    return { data: { success: true, message: 'Удалено успешно' } };
  }
};

// Добавляем интерцепторы для совместимости
api.interceptors = {
  request: {
    use: (fn) => {
      console.log('Request interceptor registered');
      return fn;
    }
  },
  response: {
    use: (successFn, errorFn) => {
      console.log('Response interceptor registered');
      return { successFn, errorFn };
    }
  }
};

export default api;