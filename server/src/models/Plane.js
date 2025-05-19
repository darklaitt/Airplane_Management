const { query } = require('../utils/database');

class Plane {
  static async getAll() {
    const result = await query('SELECT * FROM planes ORDER BY id');
    return result;
  }

  static async getById(id) {
    const result = await query('SELECT * FROM planes WHERE id = $1', [id]);
    return result[0];
  }

  static async create(planeData) {
    const { name, category, seats_count } = planeData;
    const result = await query(
      'INSERT INTO planes (name, category, seats_count) VALUES ($1, $2, $3) RETURNING *',
      [name, category, seats_count]
    );
    return result[0];
  }

  static async update(id, planeData) {
    const { name, category, seats_count } = planeData;
    const result = await query(
      'UPDATE planes SET name = $1, category = $2, seats_count = $3 WHERE id = $4 RETURNING *',
      [name, category, seats_count, id]
    );
    if (result.length === 0) {
      throw new Error('Plane not found');
    }
    return result[0];
  }

  static async delete(id) {
    // Check if plane is used in any flights
    const flights = await query('SELECT * FROM flights WHERE plane_id = $1', [id]);
    if (flights.length > 0) {
      throw new Error('Cannot delete plane: It is used in existing flights');
    }

    const result = await query('DELETE FROM planes WHERE id = $1 RETURNING id', [id]);
    if (result.length === 0) {
      throw new Error('Plane not found');
    }
    return result[0];
  }
}

module.exports = Plane;