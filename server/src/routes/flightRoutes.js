const express = require('express');
const flightController = require('../controllers/flightController');

const router = express.Router();

// Добавляем логирование для отладки
router.use((req, res, next) => {
  console.log(`[FLIGHTS] ${req.method} ${req.originalUrl}`);
  next();
});

// CRUD операции
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);
router.post('/', flightController.createFlight);
router.put('/:id', flightController.updateFlight);
router.delete('/:id', flightController.deleteFlight);

// Специальные запросы
router.get('/search/nearest', flightController.findNearestFlight);
router.get('/search/non-stop', flightController.getFlightsWithoutStops);
router.get('/search/most-expensive', flightController.getMostExpensiveFlight);
router.get('/search/replacement-candidates', flightController.getFlightsForPlaneReplacement);
router.get('/check-seats/:flightNumber', flightController.checkFreeSeats);
router.get('/plane/:planeId', flightController.getFlightsByPlane);
router.get('/load/:flightNumber', flightController.getFlightLoad);

module.exports = router;