const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT d.*, 
        COUNT(DISTINCT e.id) as employee_count,
        COALESCE(SUM(e.base_salary), 0) as total_salary_budget
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'active'
      WHERE d.is_active = true
      GROUP BY d.id
      ORDER BY d.name
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/departments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const dept = await db.query('SELECT * FROM departments WHERE id = $1', [req.params.id]);
    if (dept.rows.length === 0) {
      return res.status(404).json({ error: 'Département non trouvé.' });
    }

    const employees = await db.query(
      'SELECT id, employee_number, first_name, last_name, position_id, base_salary, employment_status FROM employees WHERE department_id = $1 ORDER BY last_name',
      [req.params.id]
    );

    res.json({ ...dept.rows[0], employees: employees.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/departments
router.post('/', async (req, res, next) => {
  try {
    const { name, code, description, managerId, parentDepartmentId, budget } = req.body;
    const result = await db.query(
      'INSERT INTO departments (name, code, description, manager_id, parent_department_id, budget) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, code, description, managerId, parentDepartmentId, budget || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/departments/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, code, description, managerId, parentDepartmentId, budget, isActive } = req.body;
    const result = await db.query(`
      UPDATE departments SET
        name = COALESCE($1, name), code = COALESCE($2, code), description = COALESCE($3, description),
        manager_id = $4, parent_department_id = $5, budget = COALESCE($6, budget),
        is_active = COALESCE($7, is_active), updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *
    `, [name, code, description, managerId, parentDepartmentId, budget, isActive, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Département non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
