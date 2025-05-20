const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, checkPermission, logAction } = require('../middlewares/auth');
const { reportValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Все отчеты требуют права на чтение отчетов
router.get('/general', 
  checkPermission('reports:read'),
  logAction('GET_GENERAL_REPORT', 'reports'),
  reportController.getGeneralReport
);

router.get('/flight-load', 
  reportValidation.flightLoad,
  handleValidationErrors,
  checkPermission('reports:read'),
  logAction('GET_FLIGHT_LOAD_REPORT', 'reports'),
  reportController.getFlightLoadReport
);

router.get('/sales', 
  reportValidation.sales,
  handleValidationErrors,
  checkPermission('reports:read'),
  logAction('GET_SALES_REPORT', 'reports'),
  reportController.getSalesReport
);

module.exports = router;