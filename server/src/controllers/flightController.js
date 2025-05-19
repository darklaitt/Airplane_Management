const Flight = require('../models/Flight');
const Plane = require('../models/Plane');

const flightController = {
  async getAllFlights(req, res, next) {
    try {
      const flights = await Flight.getAll();
      res.json({ success: true, data: flights });
    } catch (error) {
      next(error);
    }
  },

  async getFlightById(req, res, next) {
    try {
      const flight = await Flight.getById(req.params.id);
      if (!flight) {
        return res.status(404).json({ success: false, message: 'Flight not found' });
      }
      res.json({ success: true, data: flight });
    } catch (error) {
      next(error);
    }
  },

  async createFlight(req, res, next) {
    try {
      const { flight_number, plane_id, stops, departure_time, free_seats, price } = req.body;
      
      // Validation
      if (!flight_number || !plane_id || !stops || !departure_time || free_seats === undefined || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      // Check if plane exists
      const plane = await Plane.getById(plane_id);
      if (!plane) {
        return res.status(404).json({ 
          success: false, 
          message: 'Plane not found' 
        });
      }

      // Check if free seats exceeds plane capacity
      if (free_seats > plane.seats_count) {
        return res.status(400).json({ 
          success: false, 
          message: `Free seats cannot exceed plane capacity (${plane.seats_count})` 
        });
      }

      const flight = await Flight.create(req.body);
      res.status(201).json({ success: true, data: flight });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          success: false, 
          message: 'Flight number already exists' 
        });
      }
      next(error);
    }
  },

  async updateFlight(req, res, next) {
    try {
      const { flight_number, plane_id, stops, departure_time, free_seats, price } = req.body;
      
      // Validation
      if (!flight_number || !plane_id || !stops || !departure_time || free_seats === undefined || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      // Check if plane exists
      const plane = await Plane.getById(plane_id);
      if (!plane) {
        return res.status(404).json({ 
          success: false, 
          message: 'Plane not found' 
        });
      }

      // Check if free seats exceeds plane capacity
      if (free_seats > plane.seats_count) {
        return res.status(400).json({ 
          success: false, 
          message: `Free seats cannot exceed plane capacity (${plane.seats_count})` 
        });
      }

      const flight = await Flight.update(req.params.id, req.body);
      res.json({ success: true, data: flight });
    } catch (error) {
      if (error.message === 'Flight not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async deleteFlight(req, res, next) {
    try {
      await Flight.delete(req.params.id);
      res.json({ success: true, message: 'Flight deleted successfully' });
    } catch (error) {
      if (error.message === 'Flight not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Cannot delete flight')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // Special queries
  async findNearestFlight(req, res, next) {
    try {
      const { destination } = req.query;
      
      if (!destination) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide destination' 
        });
      }

      const flight = await Flight.findNearestFlight(destination);
      
      if (!flight) {
        return res.status(404).json({ 
          success: false, 
          message: 'No flights found to the specified destination with available seats' 
        });
      }

      res.json({ success: true, data: flight });
    } catch (error) {
      next(error);
    }
  },

  async getFlightsWithoutStops(req, res, next) {
    try {
      const flights = await Flight.getFlightsWithoutStops();
      res.json({ success: true, data: flights });
    } catch (error) {
      next(error);
    }
  },

  async getFlightsByPlane(req, res, next) {
    try {
      const { planeId } = req.params;
      const flights = await Flight.getFlightsByPlane(planeId);
      res.json({ success: true, data: flights });
    } catch (error) {
      next(error);
    }
  },

  async getFlightLoad(req, res, next) {
    try {
      const { flightNumber } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide start and end dates' 
        });
      }

      const load = await Flight.getFlightLoadByDateRange(flightNumber, startDate, endDate);
      
      if (!load) {
        return res.status(404).json({ 
          success: false, 
          message: 'Flight not found' 
        });
      }

      res.json({ success: true, data: load });
    } catch (error) {
      next(error);
    }
  },

  async getMostExpensiveFlight(req, res, next) {
    try {
      const flight = await Flight.getMostExpensiveFlight();
      
      if (!flight) {
        return res.status(404).json({ 
          success: false, 
          message: 'No flights found' 
        });
      }

      res.json({ success: true, data: flight });
    } catch (error) {
      next(error);
    }
  },

  async getFlightsForPlaneReplacement(req, res, next) {
    try {
      const { minFreeSeatsPercentage = 50 } = req.query;
      const flights = await Flight.getFlightsForPlaneReplacement(parseFloat(minFreeSeatsPercentage));
      res.json({ success: true, data: flights });
    } catch (error) {
      next(error);
    }
  },

  async checkFreeSeats(req, res, next) {
    try {
      const { flightNumber } = req.params;
      const flight = await Flight.getByFlightNumber(flightNumber);
      
      if (!flight) {
        return res.status(404).json({ 
          success: false, 
          message: 'Flight not found' 
        });
      }

      res.json({ 
        success: true, 
        data: {
          flight_number: flight.flight_number,
          free_seats: flight.free_seats,
          has_free_seats: flight.free_seats > 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = flightController;