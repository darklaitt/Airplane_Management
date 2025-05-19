const Plane = require('../models/Plane');

const planeController = {
  async getAllPlanes(req, res, next) {
    try {
      const planes = await Plane.getAll();
      res.json({ success: true, data: planes });
    } catch (error) {
      next(error);
    }
  },

  async getPlaneById(req, res, next) {
    try {
      const plane = await Plane.getById(req.params.id);
      if (!plane) {
        return res.status(404).json({ success: false, message: 'Plane not found' });
      }
      res.json({ success: true, data: plane });
    } catch (error) {
      next(error);
    }
  },

  async createPlane(req, res, next) {
    try {
      const { name, category, seats_count } = req.body;
      
      if (!name || !category || !seats_count) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      if (seats_count <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Seats count must be greater than 0' 
        });
      }

      const plane = await Plane.create({ name, category, seats_count });
      res.status(201).json({ success: true, data: plane });
    } catch (error) {
      next(error);
    }
  },

  async updatePlane(req, res, next) {
    try {
      const { name, category, seats_count } = req.body;
      
      if (!name || !category || !seats_count) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      if (seats_count <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Seats count must be greater than 0' 
        });
      }

      const plane = await Plane.update(req.params.id, { name, category, seats_count });
      res.json({ success: true, data: plane });
    } catch (error) {
      if (error.message === 'Plane not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async deletePlane(req, res, next) {
    try {
      await Plane.delete(req.params.id);
      res.json({ success: true, message: 'Plane deleted successfully' });
    } catch (error) {
      if (error.message === 'Plane not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Cannot delete plane')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};

module.exports = planeController;