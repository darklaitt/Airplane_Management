const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/general', reportController.getGeneralReport);
router.get('/flight-load', reportController.getFlightLoadReport);
router.get('/sales', reportController.getSalesReport);

module.exports = router;