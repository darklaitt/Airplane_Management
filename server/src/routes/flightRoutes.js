// server/src/routes/flightRoutes.js
const express = require('express');
const router = express.Router();

// Временные контроллеры для тестирования
const mockFlightController = {
  getAllFlights: (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    res.json({
      success: true,
      data: [
        {
          id: 1,
          flight_number: 'SU1234',
          plane_name: 'Boeing 737',
          stops: ['Москва', 'Санкт-Петербург'],
          departure_time: '10:00:00',
          free_seats: 150,
          price: 8500
        }
      ]
    });
  },
  
  getFlightById: (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    const { id } = req.params;
    if (id === '999') {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        flight_number: 'SU1234',
        plane_name: 'Boeing 737',
        stops: ['Москва', 'Санкт-Петербург'],
        departure_time: '10:00:00',
        free_seats: 150,
        price: 8500
      }
    });
  },
  
  createFlight: (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    const { flight_number, plane_id, stops, departure_time, free_seats, price } = req.body;
    
    if (!flight_number || !plane_id || !stops || !departure_time || 
        free_seats === undefined || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        flight_number,
        plane_id,
        stops,
        departure_time,
        free_seats,
        price
      }
    });
  },
  
  updateFlight: (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    const { id } = req.params;
    if (id === '999') {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        ...req.body
      }
    });
  },
  
  deleteFlight: (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    const { id } = req.params;
    if (id === '999') {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Flight deleted successfully'
    });
  }
};

// CRUD operations
router.get('/', mockFlightController.getAllFlights);
router.get('/:id', mockFlightController.getFlightById);
router.post('/', mockFlightController.createFlight);
router.put('/:id', mockFlightController.updateFlight);
router.delete('/:id', mockFlightController.deleteFlight);

module.exports = router;