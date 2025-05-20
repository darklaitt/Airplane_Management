const express = require('express');
const ticketController = require('../controllers/ticketController');
const { logger } = require('../utils/logger');

const router = express.Router();

// Вспомогательная функция для логирования
const logAction = (action, resource) => {
  return (req, res, next) => {
    logger.info(`API Action: ${action}`, {
      resource,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.id
    });
    next();
  };
};

// CRUD операции
router.get('/', logAction('GET_TICKETS', 'tickets'), ticketController.getAllTickets);
router.get('/:id', logAction('GET_TICKET', 'tickets'), ticketController.getTicketById);
router.post('/', logAction('CREATE_TICKET', 'tickets'), ticketController.createTicket);
router.delete('/:id', logAction('DELETE_TICKET', 'tickets'), ticketController.deleteTicket);

// Дополнительные маршруты
router.get('/flight/:flightNumber', logAction('GET_TICKETS_BY_FLIGHT', 'tickets'), ticketController.getTicketsByFlight);
router.get('/search/by-date', logAction('GET_TICKETS_BY_DATE', 'tickets'), ticketController.getTicketsByDateRange);
router.get('/reports/sales-by-counter', logAction('GET_SALES_BY_COUNTER', 'tickets'), ticketController.getSalesByCounter);

module.exports = router;

/**
 * @swagger
 * /tickets/search/by-date:
 *   get:
 *     summary: Поиск билетов по дате
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Начальная дата в формате YYYY-MM-DD
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Конечная дата в формате YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Список найденных билетов
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Загрузка файла
 *     tags: [Files]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: Файл для загрузки
 *     responses:
 *       200:
 *         description: Файл успешно загружен
 */

/**
 * @swagger
 * tags:
 *   - name: Forms
 *     description: Определение доступных форм и предоставление информации по каждой
 *   - name: Questions
 *     description: Действия с вопросами и ответами
 *   - name: PDF and Tax Parameters
 *     description: Управление PDF и налоговыми параметрами для генерации документов
 *   - name: Documentation
 *     description: Управление конфигурацией и API для генерации документации
 */