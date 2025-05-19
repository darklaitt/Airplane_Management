const express = require('express');
const planeController = require('../controllers/planeController');

const router = express.Router();

router.get('/', planeController.getAllPlanes);
router.get('/:id', planeController.getPlaneById);
router.post('/', planeController.createPlane);
router.put('/:id', planeController.updatePlane);
router.delete('/:id', planeController.deletePlane);

module.exports = router;