const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, checkPermission } = require('../middlewares/auth'); // Исправлен путь
const { reportValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// Общий отчет
router.get('/general', 
  checkPermission('reports:read'),
  reportController.getGeneralReport
);

// Отчет по загруженности рейсов
router.get('/flight-load', 
  reportValidation.flightLoad,
  handleValidationErrors,
  checkPermission('reports:read'),
  reportController.getFlightLoadReport
);

// Отчет по продажам
router.get('/sales', 
  reportValidation.sales,
  handleValidationErrors,
  checkPermission('reports:read'),
  reportController.getSalesReport
);

module.exports = router;