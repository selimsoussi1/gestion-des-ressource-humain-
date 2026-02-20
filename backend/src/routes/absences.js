const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/absences
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, employee, status, type } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (employee) { paramCount++; conditions.push(`a.employee_id = $${paramCount}`); params.push(employee); }
    if (status) { paramCount++; conditions.push(`a.status = $${paramCount}`); params.push(status); }
    if (type) { paramCount++; conditions.push(`a.absence_type_id = $${paramCount}`); params.push(type); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await db.query(`
      SELECT a.*, e.first_name, e.last_name, e.employee_number, at.name as type_name, at.code as type_code, at.color as type_color
      FROM absences a
      JOIN employees e ON a.employee_id = e.id
      JOIN absence_types at ON a.absence_type_id = at.id
      ${whereClause}
      ORDER BY a.start_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    const countResult = await db.query(`SELECT COUNT(*) FROM absences a ${whereClause}`, params);

    res.json({
      data: result.rows,
      pagination: { total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/absences/types
router.get('/types', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM absence_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/absences/balance/:employeeId
router.get('/balance/:employeeId', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const result = await db.query(`
      SELECT at.id, at.name, at.code, at.max_days_per_year, at.color,
        COALESCE(SUM(CASE WHEN a.status IN ('approved', 'pending') AND EXTRACT(YEAR FROM a.start_date) = $2 THEN a.total_days END), 0) as used_days
      FROM absence_types at
      LEFT JOIN absences a ON at.id = a.absence_type_id AND a.employee_id = $1
      GROUP BY at.id, at.name, at.code, at.max_days_per_year, at.color
      ORDER BY at.name
    `, [req.params.employeeId, currentYear]);

    const balances = result.rows.map(row => ({
      ...row,
      remaining_days: row.max_days_per_year ? row.max_days_per_year - row.used_days : null,
    }));

    res.json(balances);
  } catch (error) {
    next(error);
  }
});

// POST /api/absences
router.post('/', async (req, res, next) => {
  try {
    const { employeeId, absenceTypeId, startDate, endDate, totalDays, reason } = req.body;
    const result = await db.query(`
      INSERT INTO absences (employee_id, absence_type_id, start_date, end_date, total_days, reason)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [employeeId, absenceTypeId, startDate, endDate, totalDays, reason]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/absences/:id/approve
router.patch('/:id/approve', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE absences SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Absence non trouvée.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/absences/:id/reject
router.patch('/:id/reject', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE absences SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Absence non trouvée.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
