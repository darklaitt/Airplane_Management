const express = require('express');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Добавляем логирование для отладки
router.use((req, res, next) => {
  console.log(`[TICKETS] ${req.method} ${req.originalUrl}`);
  next();
});

// CRUD операции
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', ticketController.createTicket);
router.delete('/:id', ticketController.deleteTicket);

// Дополнительные маршруты
router.get('/flight/:flightNumber', ticketController.getTicketsByFlight);
router.get('/search/by-date', ticketController.getTicketsByDateRange);
router.get('/reports/sales-by-counter', ticketController.getSalesByCounter);

module.exports = router;