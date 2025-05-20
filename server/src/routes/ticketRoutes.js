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