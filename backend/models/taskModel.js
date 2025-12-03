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
      status || "to do",
      priority || "medium",
      due_date || null,
      voice_transcript || null,
      is_voice_created || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll(sortBy = 'created_at', order = 'DESC', filters = {}) {
    const validSortFields = ['created_at', 'due_date', 'priority', 'status', 'title'];
    const validOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

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

    query += ` ORDER BY ${sortField} ${sortOrder}`;

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
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
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

  async search(searchTerm) {
    const query = `
      SELECT * FROM tasks
      WHERE title ILIKE $1 OR description ILIKE $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  },

  async filterByStatus(status) {
    const query = `
      SELECT * FROM tasks
      WHERE status = $1
      ORDER BY 
        CASE priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        due_date ASC NULLS LAST
    `;
    const result = await pool.query(query, [status]);
    return result.rows;
  },

  async filterByPriority(priority) {
    const query = `
      SELECT * FROM tasks
      WHERE priority = $1
      ORDER BY due_date ASC NULLS LAST, created_at DESC
    `;
    const result = await pool.query(query, [priority]);
    return result.rows;
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
      AND due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + ($1 || ' days')::INTERVAL
      AND status != 'Done'
      ORDER BY due_date ASC
    `;
    const result = await pool.query(query, [days]);
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