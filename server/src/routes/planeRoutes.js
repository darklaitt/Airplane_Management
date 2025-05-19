const express = require('express');
const planeController = require('../controllers/planeController');

const router = express.Router();

// Добавляем логирование для отладки
router.use((req, res, next) => {
  console.log(`[PLANES] ${req.method} ${req.originalUrl}`);
  next();
});

// CRUD маршруты для самолетов
router.get('/', planeController.getAllPlanes);
router.get('/:id', planeController.getPlaneById);
router.post('/', planeController.createPlane);
router.put('/:id', planeController.updatePlane);
router.delete('/:id', planeController.deletePlane);

module.exports = router;