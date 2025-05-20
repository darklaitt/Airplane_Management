const express = require('express');
const reportController = require('../controllers/reportController');
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

// Маршруты отчетов
router.get('/general', logAction('GET_GENERAL_REPORT', 'reports'), reportController.getGeneralReport);
router.get('/flight-load', logAction('GET_FLIGHT_LOAD_REPORT', 'reports'), reportController.getFlightLoadReport);
router.get('/sales', logAction('GET_SALES_REPORT', 'reports'), reportController.getSalesReport);

module.exports = router;