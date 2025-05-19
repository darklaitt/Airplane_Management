const { pool } = require('../utils/database');
const Flight = require('./Flight');

class Ticket {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      ORDER BY t.sale_time DESC
    `);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.id = ?
    `, [id]);

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      stops: JSON.parse(rows[0].stops || '[]')
    };
  }

  static async create(ticketData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { counter_number, flight_number, flight_date, sale_time } = ticketData;

      // Check if flight exists and has free seats
      const [flights] = await connection.execute(
        'SELECT free_seats FROM flights WHERE flight_number = ? FOR UPDATE',
        [flight_number]
      );

      if (flights.length === 0) {
        throw new Error('Flight not found');
      }

      if (flights[0].free_seats <= 0) {
        throw new Error('No free seats available on this flight');
      }

      // Create ticket
      const [result] = await connection.execute(
        'INSERT INTO tickets (counter_number, flight_number, flight_date, sale_time) VALUES (?, ?, ?, ?)',
        [counter_number, flight_number, flight_date, sale_time]
      );

      // Update free seats
      await connection.execute(
        'UPDATE flights SET free_seats = free_seats - 1 WHERE flight_number = ?',
        [flight_number]
      );

      await connection.commit();
      return { id: result.insertId, ...ticketData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get ticket info
      const [tickets] = await connection.execute(
        'SELECT flight_number FROM tickets WHERE id = ?',
        [id]
      );

      if (tickets.length === 0) {
        throw new Error('Ticket not found');
      }

      const flightNumber = tickets[0].flight_number;

      // Delete ticket
      await connection.execute('DELETE FROM tickets WHERE id = ?', [id]);

      // Update free seats
      await connection.execute(
        'UPDATE flights SET free_seats = free_seats + 1 WHERE flight_number = ?',
        [flightNumber]
      );

      await connection.commit();
      return { id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getByFlight(flightNumber) {
    const [rows] = await pool.execute(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.flight_number = ?
      ORDER BY t.sale_time DESC
    `, [flightNumber]);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT t.*, f.departure_time, f.price, f.stops,
        p.name as plane_name, p.category as plane_category
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      JOIN planes p ON f.plane_id = p.id
      WHERE t.flight_date BETWEEN ? AND ?
      ORDER BY t.flight_date, t.sale_time
    `, [startDate, endDate]);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getSalesByCounter(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        counter_number,
        COUNT(*) as tickets_sold,
        SUM(f.price) as total_revenue
      FROM tickets t
      JOIN flights f ON t.flight_number = f.flight_number
      WHERE t.sale_time BETWEEN ? AND ?
      GROUP BY counter_number
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    return rows;
  }
}

module.exports = Ticket;