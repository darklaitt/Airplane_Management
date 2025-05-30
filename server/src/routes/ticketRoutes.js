const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, checkPermission } = require('../middlewares/auth'); // Исправлен путь
const { ticketValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// Основные CRUD операции
router.get('/', 
  checkPermission('tickets:read'),
  ticketController.getAllTickets
);

router.get('/:id', 
  ticketValidation.getById,
  handleValidationErrors,
  checkPermission('tickets:read'),
  ticketController.getTicketById
);

router.post('/', 
  ticketValidation.create,
  handleValidationErrors,
  checkPermission('tickets:write'),
  ticketController.createTicket
);

router.delete('/:id', 
  ticketValidation.delete,
  handleValidationErrors,
  checkPermission('tickets:write'),
  ticketController.deleteTicket
);

// Дополнительные маршруты
router.get('/flight/:flightNumber', 
  ticketValidation.getByFlight,
  handleValidationErrors,
  checkPermission('tickets:read'),
  ticketController.getTicketsByFlight
);

router.get('/search/by-date', 
  ticketValidation.getByDateRange,
  handleValidationErrors,
  checkPermission('tickets:read'),
  ticketController.getTicketsByDateRange
);

router.get('/reports/sales-by-counter', 
  ticketValidation.getSalesByCounter,
  handleValidationErrors,
  checkPermission('reports:read'),
  ticketController.getSalesByCounter
);

module.exports = router;