const express = require('express');
const flightController = require('../controllers/flightController');

const router = express.Router();

// CRUD operations
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);
router.post('/', flightController.createFlight);
router.put('/:id', flightController.updateFlight);
router.delete('/:id', flightController.deleteFlight);

// Special queries
router.get('/search/nearest', flightController.findNearestFlight);
router.get('/search/non-stop', flightController.getFlightsWithoutStops);
router.get('/plane/:planeId', flightController.getFlightsByPlane);
router.get('/load/:flightNumber', flightController.getFlightLoad);
router.get('/search/most-expensive', flightController.getMostExpensiveFlight);
router.get('/search/replacement-candidates', flightController.getFlightsForPlaneReplacement);
router.get('/check-seats/:flightNumber', flightController.checkFreeSeats);

module.exports = router;