const { query, getClient } = require('../utils/database');

class Flight {
  static async getAll() {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      ORDER BY f.departure_time
    `);
    return result;
  }

  static async getById(id) {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.id = $1
    `, [id]);
    
    return result[0];
  }

  static async getByFlightNumber(flightNumber) {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.flight_number = $1
    `, [flightNumber]);
    
    return result[0];
  }

  static async create(flightData) {
    const { flight_number, plane_id, stops, departure_time, free_seats, price } = flightData;
    const result = await query(
      'INSERT INTO flights (flight_number, plane_id, stops, departure_time, free_seats, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [flight_number, plane_id, JSON.stringify(stops), departure_time, free_seats, price]
    );
    return result[0];
  }

  static async update(id, flightData) {
    const { flight_number, plane_id, stops, departure_time, free_seats, price } = flightData;
    const result = await query(
      'UPDATE flights SET flight_number = $1, plane_id = $2, stops = $3, departure_time = $4, free_seats = $5, price = $6 WHERE id = $7 RETURNING *',
      [flight_number, plane_id, JSON.stringify(stops), departure_time, free_seats, price, id]
    );
    if (result.length === 0) {
      throw new Error('Flight not found');
    }
    return result[0];
  }

  static async delete(id) {
    // Check if flight has tickets
    const flight = await this.getById(id);
    if (!flight) {
      throw new Error('Flight not found');
    }

    const tickets = await query('SELECT * FROM tickets WHERE flight_number = $1', [flight.flight_number]);
    if (tickets.length > 0) {
      throw new Error('Cannot delete flight: It has sold tickets');
    }

    const result = await query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);
    return result[0];
  }

  // Special queries for the project requirements
  static async findNearestFlight(destination, minFreeSeats = 1) {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.stops::jsonb @> $1::jsonb
      AND f.free_seats >= $2
      ORDER BY f.departure_time
      LIMIT 1
    `, [JSON.stringify([destination]), minFreeSeats]);

    return result[0];
  }

  static async getFlightsWithoutStops() {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE jsonb_array_length(f.stops) <= 2
      ORDER BY f.departure_time
    `);

    return result;
  }

  static async getFlightsByPlane(planeId) {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE f.plane_id = $1
      ORDER BY f.departure_time
    `, [planeId]);

    return result;
  }

  static async getFlightLoadByDateRange(flightNumber, startDate, endDate) {
    const result = await query(`
      SELECT 
        f.flight_number,
        f.free_seats,
        p.seats_count,
        COUNT(t.id) as tickets_sold,
        (p.seats_count - f.free_seats + COUNT(t.id)) as total_occupied,
        ROUND(((p.seats_count - f.free_seats + COUNT(t.id))::numeric / p.seats_count) * 100, 2) as load_percentage
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      LEFT JOIN tickets t ON f.flight_number = t.flight_number 
        AND t.flight_date BETWEEN $2 AND $3
      WHERE f.flight_number = $1
      GROUP BY f.id, f.flight_number, f.free_seats, p.seats_count
    `, [flightNumber, startDate, endDate]);

    return result[0];
  }

  static async getMostExpensiveFlight() {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      ORDER BY f.price DESC
      LIMIT 1
    `);

    return result[0];
  }

  static async getFlightsForPlaneReplacement(minFreeSeatsPercentage = 50) {
    const result = await query(`
      SELECT f.*, p.name as plane_name, p.category as plane_category, p.seats_count,
        ROUND((f.free_seats::numeric / p.seats_count) * 100, 2) as free_seats_percentage
      FROM flights f
      JOIN planes p ON f.plane_id = p.id
      WHERE (f.free_seats::numeric / p.seats_count) * 100 >= $1
      ORDER BY free_seats_percentage DESC
    `, [minFreeSeatsPercentage]);

    return result;
  }

  static async updateFreeSeats(flightNumber, change) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      // Get current free seats
      const flights = await client.query(
        'SELECT free_seats FROM flights WHERE flight_number = $1 FOR UPDATE',
        [flightNumber]
      );

      if (flights.rows.length === 0) {
        throw new Error('Flight not found');
      }

      const newFreeSeats = flights.rows[0].free_seats + change;
      if (newFreeSeats < 0) {
        throw new Error('Not enough free seats');
      }

      // Update free seats
      await client.query(
        'UPDATE flights SET free_seats = $1 WHERE flight_number = $2',
        [newFreeSeats, flightNumber]
      );

      await client.commitTransaction();
      return { flight_number: flightNumber, free_seats: newFreeSeats };
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Flight;