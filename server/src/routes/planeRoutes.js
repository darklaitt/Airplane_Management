const express = require('express');
const planeController = require('../controllers/planeController');
const { authenticateToken, checkPermission } = require('../middlewares/authController');
const { planeValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// CRUD операции для самолетов
router.get('/', checkPermission('planes:read'), planeController.getAllPlanes);
router.get('/:id', planeValidation.getById, handleValidationErrors, checkPermission('planes:read'), planeController.getPlaneById);
router.post('/', planeValidation.create, handleValidationErrors, checkPermission('planes:write'), planeController.createPlane);
router.put('/:id', planeValidation.update, handleValidationErrors, checkPermission('planes:write'), planeController.updatePlane);
router.delete('/:id', planeValidation.delete, handleValidationErrors, checkPermission('planes:write'), planeController.deletePlane);

module.exports = router;