const { pool } = require('../utils/database');

class Flight {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      ORDER BY f.departure_time
    `);
    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    
    return {
      ...rows[0],
      stops: JSON.parse(rows[0].stops || '[]')
    };
  }

  static async getByFlightNumber(flightNumber) {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.flight_number = ?
    `, [flightNumber]);
    
    if (rows.length === 0) return null;
    
    return {
      ...rows[0],
      stops: JSON.parse(rows[0].stops || '[]')
    };
  }

  static async create(flightData) {
    const { flight_number, plane_id, stops, departure_time, free_seats, price } = flightData;
    const [result] = await pool.execute(
      'INSERT INTO flights (flight_number, plane_id, stops, departure_time, free_seats, price) VALUES (?, ?, ?, ?, ?, ?)',
      [flight_number, plane_id, JSON.stringify(stops), departure_time, free_seats, price]
    );
    return { id: result.insertId, ...flightData };
  }

  static async update(id, flightData) {
    const { flight_number, plane_id, stops, departure_time, free_seats, price } = flightData;
    const [result] = await pool.execute(
      'UPDATE flights SET flight_number = ?, plane_id = ?, stops = ?, departure_time = ?, free_seats = ?, price = ? WHERE id = ?',
      [flight_number, plane_id, JSON.stringify(stops), departure_time, free_seats, price, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Flight not found');
    }
    return { id, ...flightData };
  }

  static async delete(id) {
    // Check if flight has tickets
    const flight = await this.getById(id);
    if (!flight) {
      throw new Error('Flight not found');
    }

    const [tickets] = await pool.execute('SELECT * FROM tickets WHERE flight_number = ?', [flight.flight_number]);
    if (tickets.length > 0) {
      throw new Error('Cannot delete flight: It has sold tickets');
    }

    const [result] = await pool.execute('DELETE FROM flights WHERE id = ?', [id]);
    return { id };
  }

  // Special queries for the project requirements
  static async findNearestFlight(destination, minFreeSeats = 1) {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE JSON_CONTAINS(f.stops, ?)
      AND f.free_seats >= ?
      ORDER BY f.departure_time
      LIMIT 1
    `, [JSON.stringify(destination), minFreeSeats]);

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      stops: JSON.parse(rows[0].stops || '[]')
    };
  }

  static async getFlightsWithoutStops() {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE JSON_LENGTH(f.stops) <= 2
      ORDER BY f.departure_time
    `);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getFlightsByPlane(planeId) {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.plane_id = ?
      ORDER BY f.departure_time
    `, [planeId]);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async getFlightLoadByDateRange(flightNumber, startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        f.flight_number,
        f.free_seats,
        p.seats_count,
        COUNT(t.id) as tickets_sold,
        (p.seats_count - f.free_seats + COUNT(t.id)) as total_occupied,
        ROUND(((p.seats_count - f.free_seats + COUNT(t.id)) / p.seats_count) * 100, 2) as load_percentage
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      LEFT JOIN tickets t ON f.flight_number = t.flight_number 
        AND t.flight_date BETWEEN ? AND ?
      WHERE f.flight_number = ?
      GROUP BY f.id, f.flight_number, f.free_seats, p.seats_count
    `, [startDate, endDate, flightNumber]);

    return rows[0] || null;
  }

  static async getMostExpensiveFlight() {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      ORDER BY f.price DESC
      LIMIT 1
    `);

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      stops: JSON.parse(rows[0].stops || '[]')
    };
  }

  static async getFlightsForPlaneReplacement(minFreeSeatsPercentage = 50) {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count,
        ROUND((f.free_seats / p.seats_count) * 100, 2) as free_seats_percentage
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE (f.free_seats / p.seats_count) * 100 >= ?
      ORDER BY free_seats_percentage DESC
    `, [minFreeSeatsPercentage]);

    return rows.map(row => ({
      ...row,
      stops: JSON.parse(row.stops || '[]')
    }));
  }

  static async updateFreeSeats(flightNumber, change) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current free seats
      const [flights] = await connection.execute(
        'SELECT free_seats FROM flights WHERE flight_number = ? FOR UPDATE',
        [flightNumber]
      );

      if (flights.length === 0) {
        throw new Error('Flight not found');
      }

      const newFreeSeats = flights[0].free_seats + change;
      if (newFreeSeats < 0) {
        throw new Error('Not enough free seats');
      }

      // Update free seats
      await connection.execute(
        'UPDATE flights SET free_seats = ? WHERE flight_number = ?',
        [newFreeSeats, flightNumber]
      );

      await connection.commit();
      return { flight_number: flightNumber, free_seats: newFreeSeats };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Flight;