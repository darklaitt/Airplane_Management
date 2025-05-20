const express = require('express');
const planeController = require('../controllers/planeController');
const { authenticateToken, checkPermission, logAction } = require('../middlewares/auth');
const { planeValidation, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// GET /planes - получить все самолеты (требует права на чтение)
router.get('/', 
  checkPermission('planes:read'),
  logAction('GET_PLANES', 'planes'),
  planeController.getAllPlanes
);

// GET /planes/:id - получить самолет по ID (требует права на чтение)
router.get('/:id', 
  planeValidation.getById,
  handleValidationErrors,
  checkPermission('planes:read'),
  logAction('GET_PLANE', 'planes'),
  planeController.getPlaneById
);

// POST /planes - создать новый самолет (требует права на создание)
router.post('/', 
  planeValidation.create,
  handleValidationErrors,
  checkPermission('planes:write'),
  logAction('CREATE_PLANE', 'planes'),
  planeController.createPlane
);

// PUT /planes/:id - обновить самолет (требует права на изменение)
router.put('/:id', 
  planeValidation.update,
  handleValidationErrors,
  checkPermission('planes:write'),
  logAction('UPDATE_PLANE', 'planes'),
  planeController.updatePlane
);

// DELETE /planes/:id - удалить самолет (требует права на удаление)
router.delete('/:id', 
  planeValidation.delete,
  handleValidationErrors,
  checkPermission('planes:delete'),
  logAction('DELETE_PLANE', 'planes'),
  planeController.deletePlane
);

module.exports = router;