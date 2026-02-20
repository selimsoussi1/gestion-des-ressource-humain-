const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/recruitment
router.get('/', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (status) { paramCount++; conditions.push(`r.status = $${paramCount}`); params.push(status); }
    if (priority) { paramCount++; conditions.push(`r.priority = $${paramCount}`); params.push(priority); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await db.query(`
      SELECT r.*, d.name as department_name, p.title as position_title,
        COUNT(DISTINCT ca.id) as total_candidates,
        COUNT(DISTINCT CASE WHEN ca.status = 'hired' THEN ca.id END) as hired_count
      FROM recruitment r
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN positions p ON r.position_id = p.id
      LEFT JOIN candidates ca ON r.id = ca.recruitment_id
      ${whereClause}
      GROUP BY r.id, d.name, p.title
      ORDER BY r.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/recruitment/:id
router.get('/:id', async (req, res, next) => {
  try {
    const recruitment = await db.query(`
      SELECT r.*, d.name as department_name, p.title as position_title
      FROM recruitment r
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN positions p ON r.position_id = p.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (recruitment.rows.length === 0) return res.status(404).json({ error: 'Recrutement non trouvé.' });

    const candidates = await db.query('SELECT * FROM candidates WHERE recruitment_id = $1 ORDER BY applied_at DESC', [req.params.id]);

    res.json({ ...recruitment.rows[0], candidates: candidates.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/recruitment
router.post('/', async (req, res, next) => {
  try {
    const { positionId, title, description, requirements, departmentId, numberOfPositions, salaryRangeMin, salaryRangeMax, applicationDeadline, priority } = req.body;
    const result = await db.query(`
      INSERT INTO recruitment (position_id, title, description, requirements, department_id, number_of_positions, salary_range_min, salary_range_max, application_deadline, priority, posted_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `, [positionId, title, description, requirements, departmentId, numberOfPositions || 1, salaryRangeMin, salaryRangeMax, applicationDeadline, priority || 'medium', req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/recruitment/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, requirements, numberOfPositions, salaryRangeMin, salaryRangeMax, applicationDeadline, status, priority } = req.body;
    const result = await db.query(`
      UPDATE recruitment SET
        title = COALESCE($1, title), description = COALESCE($2, description), requirements = COALESCE($3, requirements),
        number_of_positions = COALESCE($4, number_of_positions), salary_range_min = $5, salary_range_max = $6,
        application_deadline = $7, status = COALESCE($8, status), priority = COALESCE($9, priority), updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 RETURNING *
    `, [title, description, requirements, numberOfPositions, salaryRangeMin, salaryRangeMax, applicationDeadline, status, priority, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Recrutement non trouvé.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/recruitment/:id/candidates
router.post('/:id/candidates', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, coverLetter, notes } = req.body;
    const result = await db.query(`
      INSERT INTO candidates (recruitment_id, first_name, last_name, email, phone, cover_letter, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [req.params.id, firstName, lastName, email, phone, coverLetter, notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/recruitment/candidates/:id
router.patch('/candidates/:id', async (req, res, next) => {
  try {
    const { status, rating, notes, interviewDate } = req.body;
    const result = await db.query(`
      UPDATE candidates SET
        status = COALESCE($1, status), rating = COALESCE($2, rating),
        notes = COALESCE($3, notes), interview_date = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *
    `, [status, rating, notes, interviewDate, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidat non trouvé.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
