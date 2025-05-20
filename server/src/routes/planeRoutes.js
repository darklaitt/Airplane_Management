const express = require('express');
const planeController = require('../controllers/planeController');
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
router.get('/', logAction('GET_PLANES', 'planes'), planeController.getAllPlanes);
router.get('/:id', logAction('GET_PLANE', 'planes'), planeController.getPlaneById);
router.post('/', logAction('CREATE_PLANE', 'planes'), planeController.createPlane);
router.put('/:id', logAction('UPDATE_PLANE', 'planes'), planeController.updatePlane);
router.delete('/:id', logAction('DELETE_PLANE', 'planes'), planeController.deletePlane);

module.exports = router;