const Ticket = require('../models/Ticket');

const ticketController = {
  async getAllTickets(req, res, next) {
    try {
      const tickets = await Ticket.getAll();
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  },

  async getTicketById(req, res, next) {
    try {
      const ticket = await Ticket.getById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  },

  async createTicket(req, res, next) {
    try {
      const { counter_number, flight_number, flight_date, sale_time } = req.body;
      
      // Validation
      if (!counter_number || !flight_number || !flight_date || !sale_time) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      const ticket = await Ticket.create(req.body);
      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      if (error.message === 'Flight not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'No free seats available on this flight') {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async deleteTicket(req, res, next) {
    try {
      await Ticket.delete(req.params.id);
      res.json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      if (error.message === 'Ticket not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async getTicketsByFlight(req, res, next) {
    try {
      const { flightNumber } = req.params;
      const tickets = await Ticket.getByFlight(flightNumber);
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  },

  async getTicketsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide start and end dates' 
        });
      }

      const tickets = await Ticket.getByDateRange(startDate, endDate);
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  },

  async getSalesByCounter(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide start and end dates' 
        });
      }

      const sales = await Ticket.getSalesByCounter(startDate, endDate);
      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ticketController;