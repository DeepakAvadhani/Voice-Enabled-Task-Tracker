const { pool } = require("../config/database");

const taskModel = {
  async create(data) {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      voice_transcript,
      is_voice_created,
    } = data;
    const query = `INSERT INTO tasks (title,description,status,priority,due_date,voice_transcript,is_voice_created)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

    const values = [
      title,
      description || null,
      status || "To Do",
      priority || "Medium",
      due_date || null,
      voice_transcript || null,
      is_voice_created || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll(filters = {}) {
    let query = "SELECT * FROM tasks WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.is_voice_created !== undefined) {
      query += ` AND is_voice_created = $${paramCount}`;
      values.push(filters.is_voice_created);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const query = "SELECT * FROM tasks WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async update(id, taskData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "due_date",
      "voice_transcript",
      "is_voice_created",
    ];

    allowedFields.forEach((field) => {
      if (taskData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(taskData[field]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE tasks 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async deleteAll() {
    const query = "DELETE FROM tasks";
    await pool.query(query);
    return { message: "All tasks deleted" };
  },

  async countByStatus() {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async findUpcoming(days = 7) {
    const query = `
      SELECT * FROM tasks 
      WHERE due_date IS NOT NULL 
      AND due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '${days} days'
      AND status != 'Done'
      ORDER BY due_date ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async findOverdue() {
    const query = `
      SELECT * FROM tasks 
      WHERE due_date < CURRENT_TIMESTAMP 
      AND status != 'Done'
      ORDER BY due_date ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = taskModel;