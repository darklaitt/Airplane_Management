const express = require('express');
const planeController = require('../controllers/planeController');
const { authenticateToken, checkPermission } = require('../middlewares/auth'); // Исправлен путь
const { planeValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// GET /api/planes - получить все самолеты
router.get('/', 
  checkPermission('planes:read'),
  planeController.getAllPlanes
);

// GET /api/planes/:id - получить самолет по ID
router.get('/:id', 
  planeValidation.getById,
  handleValidationErrors,
  checkPermission('planes:read'),
  planeController.getPlaneById
);

// POST /api/planes - создать новый самолет
router.post('/', 
  planeValidation.create,
  handleValidationErrors,
  checkPermission('planes:write'),
  planeController.createPlane
);

// PUT /api/planes/:id - обновить самолет
router.put('/:id', 
  planeValidation.update,
  handleValidationErrors,
  checkPermission('planes:write'),
  planeController.updatePlane
);

// DELETE /api/planes/:id - удалить самолет
router.delete('/:id', 
  planeValidation.delete,
  handleValidationErrors,
  checkPermission('planes:write'),
  planeController.deletePlane
);

module.exports = router;