// Mock models for testing

const mockPlane = {
  id: 1,
  name: 'Boeing 737',
  category: 'Средний',
  seats_count: 180,
  created_at: new Date(),
  updated_at: new Date()
};

const mockFlight = {
  id: 1,
  flight_number: 'SU1234',
  plane_id: 1,
  plane_name: 'Boeing 737',
  stops: ['Москва', 'Санкт-Петербург'],
  departure_time: '10:00:00',
  free_seats: 150,
  price: 8500.00,
  seats_count: 180,
  created_at: new Date(),
  updated_at: new Date()
};

const mockTicket = {
  id: 1,
  counter_number: 1,
  flight_number: 'SU1234',
  flight_date: '2025-05-15',
  sale_time: new Date(),
  plane_name: 'Boeing 737',
  stops: ['Москва', 'Санкт-Петербург'],
  price: 8500.00,
  created_at: new Date()
};

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  password_hash: '$2b$12$hashedpassword',
  role_name: 'admin',
  permissions: ['*'],
  is_active: true,
  locked_until: null,
  failed_login_attempts: 0,
  last_login: new Date(),
  created_at: new Date(),
  updated_at: new Date()
};

module.exports = {
  mockPlane,
  mockFlight,
  mockTicket,
  mockUser
};