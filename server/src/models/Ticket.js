const { query, getClient } = require('../utils/database');
const Flight = require('./Flight');

class Ticket {
  static async getAll() {
    const result = await query(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      ORDER BY t.sale_time DESC
    `);

    return result;
  }

  static async getById(id) {
    const result = await query(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.id = $1
    `, [id]);

    return result[0];
  }

  static async create(ticketData) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      const { counter_number, flight_number, flight_date, sale_time } = ticketData;

      // Check if flight exists and has free seats
      const flights = await client.query(
        'SELECT free_seats FROM flights WHERE flight_number = $1 FOR UPDATE',
        [flight_number]
      );

      if (flights.rows.length === 0) {
        throw new Error('Flight not found');
      }

      if (flights.rows[0].free_seats <= 0) {
        throw new Error('No free seats available on this flight');
      }

      // Create ticket
      const result = await client.query(
        'INSERT INTO tickets (counter_number, flight_number, flight_date, sale_time) VALUES ($1, $2, $3, $4) RETURNING *',
        [counter_number, flight_number, flight_date, sale_time]
      );

      // Update free seats
      await client.query(
        'UPDATE flights SET free_seats = free_seats - 1 WHERE flight_number = $1',
        [flight_number]
      );

      await client.commitTransaction();
      return result.rows[0];
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      // Get ticket info
      const tickets = await client.query(
        'SELECT flight_number FROM tickets WHERE id = $1',
        [id]
      );

      if (tickets.rows.length === 0) {
        throw new Error('Ticket not found');
      }

      const flightNumber = tickets.rows[0].flight_number;

      // Delete ticket
      await client.query('DELETE FROM tickets WHERE id = $1', [id]);

      // Update free seats
      await client.query(
        'UPDATE flights SET free_seats = free_seats + 1 WHERE flight_number = $1',
        [flightNumber]
      );

      await client.commitTransaction();
      return { id };
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }

  static async getByFlight(flightNumber) {
    const result = await query(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.flight_number = $1
      ORDER BY t.sale_time DESC
    `, [flightNumber]);

    return result;
  }

  static async getByDateRange(startDate, endDate) {
    const result = await query(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.flight_date BETWEEN $1 AND $2
      ORDER BY t.flight_date, t.sale_time
    `, [startDate, endDate]);

    return result;
  }

  static async getSalesByCounter(startDate, endDate) {
    const result = await query(`
      SELECT 
        counter_number,
        COUNT(*) as tickets_sold,
        SUM(f.price) as total_revenue
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      WHERE t.sale_time BETWEEN $1 AND $2
      GROUP BY counter_number
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    return result;
  }
}

module.exports = Ticket;