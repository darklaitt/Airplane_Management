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

/**
 * @swagger
 * tags:
 *   name: Planes
 *   description: API для управления самолетами
 */

/**
 * @swagger
 * /planes:
 *   get:
 *     summary: Получить список всех самолетов
 *     tags: [Planes]
 *     responses:
 *       200:
 *         description: Список самолетов
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
 *                     $ref: '#/components/schemas/Plane'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', planeController.getAllPlanes);

/**
 * @swagger
 * /planes/{id}:
 *   get:
 *     summary: Получить самолет по ID
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID самолета
 *     responses:
 *       200:
 *         description: Данные самолета
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Plane'
 *       404:
 *         description: Самолет не найден
 */
router.get('/:id', planeController.getPlaneById);

/**
 * @swagger
 * /planes:
 *   post:
 *     summary: Создать новый самолет
 *     tags: [Planes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlaneInput'
 *     responses:
 *       201:
 *         description: Самолет успешно создан
 *       400:
 *         description: Неверные данные запроса
 */
router.post('/', planeController.createPlane);

/**
 * @swagger
 * components:
 *   schemas:
 *     Plane:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - seats_count
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор самолета
 *           example: 1
 *         name:
 *           type: string
 *           description: Название модели самолета
 *           example: Boeing 737-800
 *         category:
 *           type: string
 *           description: Категория самолета
 *           enum: [Региональный, Средний, Дальний]
 *           example: Средний
 *         seats_count:
 *           type: integer
 *           description: Количество мест
 *           example: 189
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Дата обновления записи
 *     
 *     PlaneInput:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - seats_count
 *       properties:
 *         name:
 *           type: string
 *           description: Название модели самолета
 *           example: Boeing 737-800
 *         category:
 *           type: string
 *           description: Категория самолета
 *           enum: [Региональный, Средний, Дальний]
 *           example: Средний
 *         seats_count:
 *           type: integer
 *           description: Количество мест
 *           example: 189
 */