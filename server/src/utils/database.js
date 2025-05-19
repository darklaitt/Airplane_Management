const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Функция для выполнения запросов
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (error) {
    throw error;
  }
};

// Функция для транзакций
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => client.release();
  
  // Monkey patch the query method to keep track of the last query
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
};

module.exports = {
  pool,
  testConnection,
  query,
  getClient
};