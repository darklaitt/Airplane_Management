const { pool } = require('../utils/database');

class Plane {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM planes ORDER BY id');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM planes WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(planeData) {
    const { name, category, seats_count } = planeData;
    const [result] = await pool.execute(
      'INSERT INTO planes (name, category, seats_count) VALUES (?, ?, ?)',
      [name, category, seats_count]
    );
    return { id: result.insertId, ...planeData };
  }

  static async update(id, planeData) {
    const { name, category, seats_count } = planeData;
    const [result] = await pool.execute(
      'UPDATE planes SET name = ?, category = ?, seats_count = ? WHERE id = ?',
      [name, category, seats_count, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Plane not found');
    }
    return { id, ...planeData };
  }

  static async delete(id) {
    // Check if plane is used in any flights
    const [flights] = await pool.execute('SELECT * FROM flights WHERE plane_id = ?', [id]);
    if (flights.length > 0) {
      throw new Error('Cannot delete plane: It is used in existing flights');
    }

    const [result] = await pool.execute('DELETE FROM planes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Plane not found');
    }
    return { id };
  }
}

module.exports = Plane;