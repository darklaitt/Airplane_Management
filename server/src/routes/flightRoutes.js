const express = require('express');
const flightController = require('../controllers/flightController');
const { authenticateToken, checkPermission } = require('../middlewares/auth'); // Исправлен путь
const { flightValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// CRUD operations
router.get('/', 
  checkPermission('flights:read'),
  flightController.getAllFlights
);

router.get('/:id', 
  flightValidation.getById,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.getFlightById
);

router.post('/', 
  flightValidation.create,
  handleValidationErrors,
  checkPermission('flights:write'),
  flightController.createFlight
);

router.put('/:id', 
  flightValidation.update,
  handleValidationErrors,
  checkPermission('flights:write'),
  flightController.updateFlight
);

router.delete('/:id', 
  flightValidation.delete,
  handleValidationErrors,
  checkPermission('flights:write'),
  flightController.deleteFlight
);

// Special queries
router.get('/search/nearest', 
  flightValidation.findNearest,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.findNearestFlight
);

router.get('/search/non-stop', 
  checkPermission('flights:read'),
  flightController.getFlightsWithoutStops
);

router.get('/plane/:planeId', 
  flightValidation.getByPlane,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.getFlightsByPlane
);

router.get('/load/:flightNumber', 
  flightValidation.getFlightLoad,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.getFlightLoad
);

router.get('/search/most-expensive', 
  checkPermission('flights:read'),
  flightController.getMostExpensiveFlight
);

router.get('/search/replacement-candidates', 
  flightValidation.getReplacementCandidates,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.getFlightsForPlaneReplacement
);

router.get('/check-seats/:flightNumber', 
  flightValidation.checkSeats,
  handleValidationErrors,
  checkPermission('flights:read'),
  flightController.checkFreeSeats
);

module.exports = router;