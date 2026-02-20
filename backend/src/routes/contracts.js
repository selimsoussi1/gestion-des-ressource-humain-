const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/contracts
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (status) { paramCount++; conditions.push(`c.status = $${paramCount}`); params.push(status); }
    if (type) { paramCount++; conditions.push(`c.contract_type = $${paramCount}`); params.push(type); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await db.query(`
      SELECT c.*, e.first_name, e.last_name, e.employee_number
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      ${whereClause}
      ORDER BY c.start_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    const countResult = await db.query(`SELECT COUNT(*) FROM contracts c ${whereClause}`, params);

    res.json({
      data: result.rows,
      pagination: { total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/contracts
router.post('/', async (req, res, next) => {
  try {
    const { employeeId, contractType, contractNumber, startDate, endDate, probationEndDate, salary, workingHoursPerWeek, terms } = req.body;
    const result = await db.query(`
      INSERT INTO contracts (employee_id, contract_type, contract_number, start_date, end_date, probation_end_date, salary, working_hours_per_week, terms)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [employeeId, contractType, contractNumber, startDate, endDate, probationEndDate, salary, workingHoursPerWeek || 40, terms]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contracts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { contractType, endDate, salary, workingHoursPerWeek, terms, status } = req.body;
    const result = await db.query(`
      UPDATE contracts SET
        contract_type = COALESCE($1, contract_type), end_date = $2,
        salary = COALESCE($3, salary), working_hours_per_week = COALESCE($4, working_hours_per_week),
        terms = COALESCE($5, terms), status = COALESCE($6, status), updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *
    `, [contractType, endDate, salary, workingHoursPerWeek, terms, status, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Contrat non trouvé.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
