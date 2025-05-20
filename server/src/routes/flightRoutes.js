const express = require('express');
const flightController = require('../controllers/flightController');
const { authenticateToken, checkPermission, logAction } = require('../middlewares/auth');
const { flightValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// CRUD operations
router.get('/', 
  checkPermission('flights:read'),
  logAction('GET_FLIGHTS', 'flights'),
  flightController.getAllFlights
);

router.get('/:id', 
  flightValidation.getById,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('GET_FLIGHT', 'flights'),
  flightController.getFlightById
);

router.post('/', 
  flightValidation.create,
  handleValidationErrors,
  checkPermission('flights:write'),
  logAction('CREATE_FLIGHT', 'flights'),
  flightController.createFlight
);

router.put('/:id', 
  flightValidation.update,
  handleValidationErrors,
  checkPermission('flights:write'),
  logAction('UPDATE_FLIGHT', 'flights'),
  flightController.updateFlight
);

router.delete('/:id', 
  flightValidation.delete,
  handleValidationErrors,
  checkPermission('flights:delete'),
  logAction('DELETE_FLIGHT', 'flights'),
  flightController.deleteFlight
);

// Special queries (все требуют права на чтение)
router.get('/search/nearest', 
  flightValidation.findNearest,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('SEARCH_NEAREST_FLIGHT', 'flights'),
  flightController.findNearestFlight
);

router.get('/search/non-stop', 
  checkPermission('flights:read'),
  logAction('GET_NON_STOP_FLIGHTS', 'flights'),
  flightController.getFlightsWithoutStops
);

router.get('/plane/:planeId', 
  flightValidation.getByPlane,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('GET_FLIGHTS_BY_PLANE', 'flights'),
  flightController.getFlightsByPlane
);

router.get('/load/:flightNumber', 
  flightValidation.getFlightLoad,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('GET_FLIGHT_LOAD', 'flights'),
  flightController.getFlightLoad
);

router.get('/search/most-expensive', 
  checkPermission('flights:read'),
  logAction('GET_MOST_EXPENSIVE_FLIGHT', 'flights'),
  flightController.getMostExpensiveFlight
);

router.get('/search/replacement-candidates', 
  flightValidation.getReplacementCandidates,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('GET_REPLACEMENT_CANDIDATES', 'flights'),
  flightController.getFlightsForPlaneReplacement
);

router.get('/check-seats/:flightNumber', 
  flightValidation.checkSeats,
  handleValidationErrors,
  checkPermission('flights:read'),
  logAction('CHECK_FLIGHT_SEATS', 'flights'),
  flightController.checkFreeSeats
);

module.exports = router;