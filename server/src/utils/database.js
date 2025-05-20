const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  max: config.database.max,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  acquireTimeoutMillis: config.database.acquireTimeoutMillis,
  createTimeoutMillis: config.database.createTimeoutMillis,
  reapIntervalMillis: config.database.reapIntervalMillis,
  createRetryIntervalMillis: config.database.createRetryIntervalMillis,
  ssl: config.database.ssl
});

// Test database connection with retry logic
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ База данных подключена успешно');
      client.release();
      return true;
    } catch (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      if (i === retries - 1) {
        if (error.code === 'ECONNREFUSED') {
          console.log('Make sure PostgreSQL is running: docker-compose up -d postgres');
        }
        // Не останавливаем сервер, продолжаем работу без БД
        console.log('⚠️  Сервер будет работать в режиме без базы данных');
        return false;
      }
      // Ждем перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
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

// Функция для транзакций
const getClient = async () => {
  try {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = () => client.release();
    
    // Автоматическое освобождение через 5 секунд
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      client.release();
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  pool,
  testConnection,
  query,
  getClient
};