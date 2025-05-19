const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');

const reportController = {
  async getGeneralReport(req, res, next) {
    try {
      // Get all flights
      const flights = await Flight.getAll();
      
      // Get flights without stops
      const flightsWithoutStops = await Flight.getFlightsWithoutStops();
      
      // Get most expensive flight
      const mostExpensiveFlight = await Flight.getMostExpensiveFlight();
      
      // Get flights suitable for plane replacement
      const flightsForReplacement = await Flight.getFlightsForPlaneReplacement();

      // Calculate statistics
      const totalFlights = flights.length;
      const totalDirectFlights = flightsWithoutStops.length;
      const averagePrice = flights.reduce((sum, flight) => sum + parseFloat(flight.price), 0) / totalFlights || 0;
      const totalCapacity = flights.reduce((sum, flight) => sum + flight.seats_count, 0);
      const totalFreeSeats = flights.reduce((sum, flight) => sum + flight.free_seats, 0);
      const overallLoadPercentage = ((totalCapacity - totalFreeSeats) / totalCapacity * 100).toFixed(2);

      const report = {
        summary: {
          totalFlights,
          totalDirectFlights,
          flightsWithConnections: totalFlights - totalDirectFlights,
          averagePrice: averagePrice.toFixed(2),
          totalCapacity,
          totalFreeSeats,
          overallLoadPercentage
        },
        mostExpensiveFlight,
        flightsForReplacement: flightsForReplacement.map(flight => ({
          flight_number: flight.flight_number,
          plane_name: flight.plane_name,
          free_seats: flight.free_seats,
          seats_count: flight.seats_count,
          free_seats_percentage: flight.free_seats_percentage
        }))
      };

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async getFlightLoadReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide start and end dates' 
        });
      }

      // Get all flights
      const flights = await Flight.getAll();
      
      // Get load for each flight
      const loadReport = await Promise.all(flights.map(async (flight) => {
        const load = await Flight.getFlightLoadByDateRange(flight.flight_number, startDate, endDate);
        return {
          flight_number: flight.flight_number,
          plane_name: flight.plane_name,
          departure_time: flight.departure_time,
          seats_count: flight.seats_count,
          ...load
        };
      }));

      // Sort by load percentage
      loadReport.sort((a, b) => b.load_percentage - a.load_percentage);

      res.json({ success: true, data: loadReport });
    } catch (error) {
      next(error);
    }
  },

  async getSalesReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide start and end dates' 
        });
      }

      // Get sales by counter
      const salesByCounter = await Ticket.getSalesByCounter(startDate, endDate);
      
      // Get all tickets in date range
      const tickets = await Ticket.getByDateRange(startDate, endDate);
      
      // Calculate total stats
      const totalTickets = tickets.length;
      const totalRevenue = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0);
      
      // Group by flight
      const salesByFlight = tickets.reduce((acc, ticket) => {
        if (!acc[ticket.flight_number]) {
          acc[ticket.flight_number] = {
            flight_number: ticket.flight_number,
            tickets_sold: 0,
            revenue: 0
          };
        }
        acc[ticket.flight_number].tickets_sold++;
        acc[ticket.flight_number].revenue += parseFloat(ticket.price);
        return acc;
      }, {});

      const salesByFlightArray = Object.values(salesByFlight).sort((a, b) => b.revenue - a.revenue);

      const report = {
        summary: {
          totalTickets,
          totalRevenue: totalRevenue.toFixed(2),
          averageTicketPrice: (totalRevenue / totalTickets).toFixed(2),
          dateRange: { startDate, endDate }
        },
        salesByCounter,
        salesByFlight: salesByFlightArray
      };

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;