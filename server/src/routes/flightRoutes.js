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

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: API для управления рейсами
 */

/**
 * @swagger
 * /flights:
 *   get:
 *     summary: Получить список всех рейсов
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Список рейсов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flight'
 */
router.get('/', flightController.getAllFlights);

/**
 * @swagger
 * /flights/search/nearest:
 *   get:
 *     summary: Найти ближайший рейс до заданного пункта
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         required: true
 *         description: Пункт назначения
 *     responses:
 *       200:
 *         description: Найденный ближайший рейс
 *       404:
 *         description: Рейс не найден
 */
router.get('/search/nearest', flightController.findNearestFlight);

/**
 * @swagger
 * /flights/search/non-stop:
 *   get:
 *     summary: Получить список рейсов без промежуточных посадок
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Список прямых рейсов
 */
router.get('/search/non-stop', flightController.getFlightsWithoutStops);

/**
 * @swagger
 * /flights/check-seats/{flightNumber}:
 *   get:
 *     summary: Проверить наличие свободных мест на рейс
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: flightNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Номер рейса (например, SU1234)
 *     responses:
 *       200:
 *         description: Информация о свободных местах
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     flight_number:
 *                       type: string
 *                       example: SU1234
 *                     free_seats:
 *                       type: integer
 *                       example: 150
 *                     has_free_seats:
 *                       type: boolean
 *                       example: true
 */
router.get('/check-seats/:flightNumber', flightController.checkFreeSeats);

