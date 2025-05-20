const { Pool } = require('pg');

// Конфигурация базы данных
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'airline_management',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Тестируем подключение при запуске
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Make sure PostgreSQL is running: docker-compose up -d postgres');
    return false;
  }
};

// Функция для выполнения запросов с обработкой ошибок
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Функция для получения клиента для транзакций
const getClient = async () => {
  try {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = () => client.release();
    
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    return {
      query,
      release: () => {
        clearTimeout(timeout);
        client.release();
      },
      beginTransaction: () => client.query('BEGIN'),
      commitTransaction: () => client.query('COMMIT'),
      rollbackTransaction: () => client.query('ROLLBACK'),
    };
  } catch (error) {
    console.error('Failed to get database client:', error);
    throw error;
  }
};

// Проверяем подключение при загрузке модуля
testConnection();

module.exports = {
  pool,
  testConnection,
  query,
  getClient
};