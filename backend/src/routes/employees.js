const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/employees - List all with filters, search, pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, department, status, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(`(e.first_name ILIKE $${paramCount} OR e.last_name ILIKE $${paramCount} OR e.employee_number ILIKE $${paramCount} OR e.email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }
    if (department) {
      paramCount++;
      conditions.push(`e.department_id = $${paramCount}`);
      params.push(department);
    }
    if (status) {
      paramCount++;
      conditions.push(`e.employment_status = $${paramCount}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const allowedSorts = ['created_at', 'first_name', 'last_name', 'hire_date', 'base_salary'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const orderDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await db.query(`SELECT COUNT(*) FROM employees e ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT e.*, d.name as department_name, p.title as position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      ${whereClause}
      ORDER BY e.${sortField} ${orderDir}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT e.*, d.name as department_name, p.title as position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees
router.post('/', [
  body('firstName').notEmpty().withMessage('Prénom requis'),
  body('lastName').notEmpty().withMessage('Nom requis'),
  body('hireDate').isDate().withMessage('Date d\'embauche invalide'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employeeNumber, firstName, lastName, dateOfBirth, gender, nationality, nationalId,
      socialSecurityNumber, maritalStatus, numberOfChildren, email, phone, address, city,
      postalCode, country, emergencyContactName, emergencyContactPhone, departmentId,
      positionId, hireDate, employmentType, baseSalary, bankName, bankAccount, rib
    } = req.body;

    // Auto-generate employee number if not provided
    let empNum = employeeNumber;
    if (!empNum) {
      const countRes = await db.query('SELECT COUNT(*) FROM employees');
      empNum = `EMP${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;
    }

    const result = await db.query(`
      INSERT INTO employees (
        employee_number, first_name, last_name, date_of_birth, gender, nationality, national_id,
        social_security_number, marital_status, number_of_children, email, phone, address, city,
        postal_code, country, emergency_contact_name, emergency_contact_phone, department_id,
        position_id, hire_date, employment_type, base_salary, bank_name, bank_account, rib
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
      RETURNING *
    `, [empNum, firstName, lastName, dateOfBirth, gender, nationality, nationalId,
        socialSecurityNumber, maritalStatus, numberOfChildren || 0, email, phone, address, city,
        postalCode, country || 'Tunisie', emergencyContactName, emergencyContactPhone, departmentId,
        positionId, hireDate, employmentType || 'full_time', baseSalary || 0, bankName, bankAccount, rib]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res, next) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, nationality, nationalId,
      socialSecurityNumber, maritalStatus, numberOfChildren, email, phone, address, city,
      postalCode, country, emergencyContactName, emergencyContactPhone, departmentId,
      positionId, employmentStatus, employmentType, baseSalary, bankName, bankAccount, rib
    } = req.body;

    const result = await db.query(`
      UPDATE employees SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        date_of_birth = COALESCE($3, date_of_birth),
        gender = COALESCE($4, gender),
        nationality = COALESCE($5, nationality),
        national_id = COALESCE($6, national_id),
        social_security_number = COALESCE($7, social_security_number),
        marital_status = COALESCE($8, marital_status),
        number_of_children = COALESCE($9, number_of_children),
        email = COALESCE($10, email),
        phone = COALESCE($11, phone),
        address = COALESCE($12, address),
        city = COALESCE($13, city),
        postal_code = COALESCE($14, postal_code),
        country = COALESCE($15, country),
        emergency_contact_name = COALESCE($16, emergency_contact_name),
        emergency_contact_phone = COALESCE($17, emergency_contact_phone),
        department_id = COALESCE($18, department_id),
        position_id = COALESCE($19, position_id),
        employment_status = COALESCE($20, employment_status),
        employment_type = COALESCE($21, employment_type),
        base_salary = COALESCE($22, base_salary),
        bank_name = COALESCE($23, bank_name),
        bank_account = COALESCE($24, bank_account),
        rib = COALESCE($25, rib),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $26
      RETURNING *
    `, [firstName, lastName, dateOfBirth, gender, nationality, nationalId,
        socialSecurityNumber, maritalStatus, numberOfChildren, email, phone, address, city,
        postalCode, country, emergencyContactName, emergencyContactPhone, departmentId,
        positionId, employmentStatus, employmentType, baseSalary, bankName, bankAccount, rib, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE employees SET employment_status = $1, termination_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['terminated', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé.' });
    }
    res.json({ message: 'Employé désactivé avec succès.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
