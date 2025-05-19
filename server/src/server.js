const app = require('./app');
const config = require('./config/config');
const { testConnection } = require('./utils/database');

const startServer = async () => {
  try {
    console.log('🚀 Запуск сервера...');
    console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Порт: ${config.port || 5000}`);

    // Проверяем подключение к базе данных
    console.log('🔍 Проверка подключения к базе данных...');
    await testConnection();
    console.log('✅ База данных подключена успешно');

    // Запускаем сервер
    const server = app.listen(config.port || 5000, () => {
      console.log('✅ Сервер запущен успешно!');
      console.log(`🌐 API доступен по адресу: http://localhost:${config.port || 5000}`);
      console.log(`🏥 Health check: http://localhost:${config.port || 5000}/health`);
      console.log(`✈️  Самолеты: http://localhost:${config.port || 5000}/api/planes`);
      console.log(`🛫 Рейсы: http://localhost:${config.port || 5000}/api/flights`);
      console.log(`🎫 Билеты: http://localhost:${config.port || 5000}/api/tickets`);
      console.log('📊 Отчеты: http://localhost:${config.port || 5000}/api/reports');
    });

    // Обработка ошибок сервера
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Порт ${config.port || 5000} уже используется`);
        console.log('Попробуйте:');
        console.log(`  - Остановить процесс: lsof -ti:${config.port || 5000} | xargs kill -9`);
        console.log('  - Или изменить порт в .env файле');
      } else {
        console.error('❌ Ошибка сервера:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`);
      server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Обработка неотслеженных ошибок
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection:', reason);
      console.error('At promise:', promise);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Возможные решения:');
      console.log('1. Проверьте, что PostgreSQL запущен: docker-compose up -d postgres');
      console.log('2. Проверьте настройки в .env файле');
      console.log('3. Проверьте, что база данных создана');
    }
    
    process.exit(1);
  }
};

startServer();