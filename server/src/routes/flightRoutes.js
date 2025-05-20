const express = require('express');
const flightController = require('../controllers/flightController');
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
router.get('/', logAction('GET_FLIGHTS', 'flights'), flightController.getAllFlights);
router.get('/:id', logAction('GET_FLIGHT', 'flights'), flightController.getFlightById);
router.post('/', logAction('CREATE_FLIGHT', 'flights'), flightController.createFlight);
router.put('/:id', logAction('UPDATE_FLIGHT', 'flights'), flightController.updateFlight);
router.delete('/:id', logAction('DELETE_FLIGHT', 'flights'), flightController.deleteFlight);

// Специальные запросы
router.get('/search/nearest', logAction('FIND_NEAREST_FLIGHT', 'flights'), flightController.findNearestFlight);
router.get('/search/non-stop', logAction('GET_NON_STOP_FLIGHTS', 'flights'), flightController.getFlightsWithoutStops);
router.get('/plane/:planeId', logAction('GET_FLIGHTS_BY_PLANE', 'flights'), flightController.getFlightsByPlane);
router.get('/load/:flightNumber', logAction('GET_FLIGHT_LOAD', 'flights'), flightController.getFlightLoad);
router.get('/search/most-expensive', logAction('GET_MOST_EXPENSIVE_FLIGHT', 'flights'), flightController.getMostExpensiveFlight);
router.get('/search/replacement-candidates', logAction('GET_REPLACEMENT_CANDIDATES', 'flights'), flightController.getFlightsForPlaneReplacement);
router.get('/check-seats/:flightNumber', logAction('CHECK_FREE_SEATS', 'flights'), flightController.checkFreeSeats);

module.exports = router;