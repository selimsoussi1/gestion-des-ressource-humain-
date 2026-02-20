const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/payroll - List payroll records
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, employee, month, year, status } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (employee) { paramCount++; conditions.push(`p.employee_id = $${paramCount}`); params.push(employee); }
    if (status) { paramCount++; conditions.push(`p.status = $${paramCount}`); params.push(status); }
    if (month && year) {
      paramCount++;
      conditions.push(`EXTRACT(MONTH FROM p.pay_period_start) = $${paramCount}`);
      params.push(parseInt(month));
      paramCount++;
      conditions.push(`EXTRACT(YEAR FROM p.pay_period_start) = $${paramCount}`);
      params.push(parseInt(year));
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM payroll p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT p.*, e.first_name, e.last_name, e.employee_number, d.name as department_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY p.pay_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({ data: result.rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// GET /api/payroll/parameters
router.get('/parameters', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM payroll_parameters WHERE is_active = true ORDER BY param_type, param_name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/payroll/parameters
router.post('/parameters', async (req, res, next) => {
  try {
    const { paramName, paramCode, paramType, value, isPercentage, description, effectiveDate } = req.body;
    const result = await db.query(
      'INSERT INTO payroll_parameters (param_name, param_code, param_type, value, is_percentage, description, effective_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [paramName, paramCode, paramType, value, isPercentage || false, description, effectiveDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/payroll/calculate - Automated payroll calculation
router.post('/calculate', async (req, res, next) => {
  try {
    const { employeeId, periodStart, periodEnd, payDate, overtimeHours, bonuses } = req.body;

    // Get employee data
    const empResult = await db.query('SELECT * FROM employees WHERE id = $1', [employeeId]);
    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé.' });
    }
    const employee = empResult.rows[0];

    // Get active payroll parameters
    const paramsResult = await db.query(
      'SELECT * FROM payroll_parameters WHERE is_active = true AND effective_date <= $1 AND (end_date IS NULL OR end_date >= $1)',
      [periodStart]
    );
    const params = {};
    paramsResult.rows.forEach(p => { params[p.param_code] = p; });

    // Calculate salary components
    const baseSalary = parseFloat(employee.base_salary);
    const hourlyRate = baseSalary / 173.33;
    const otHours = parseFloat(overtimeHours) || 0;
    const overtimeAmount = parseFloat((otHours * hourlyRate * 1.5).toFixed(2));
    const bonusAmount = parseFloat(bonuses) || 0;
    const transportAllowance = params['TRANSPORT'] ? parseFloat(params['TRANSPORT'].value) : 0;
    const presenceBonus = params['PRESENCE'] ? parseFloat(params['PRESENCE'].value) : 0;
    const allowances = transportAllowance + presenceBonus;
    const grossSalary = parseFloat((baseSalary + overtimeAmount + bonusAmount + allowances).toFixed(2));

    // Deductions - CNSS
    const cnssRate = params['CNSS_EMP'] ? parseFloat(params['CNSS_EMP'].value) / 100 : 0.0918;
    const socialSecurity = parseFloat((grossSalary * cnssRate).toFixed(2));

    // Deductions - Income Tax (simplified IRPP)
    const taxableIncome = grossSalary - socialSecurity;
    const annualTaxable = taxableIncome * 12;
    let annualTax = 0;
    if (annualTaxable > 50000) annualTax = (annualTaxable - 50000) * 0.35 + 6400 + 2800 + 2600;
    else if (annualTaxable > 30000) annualTax = (annualTaxable - 30000) * 0.32 + 2800 + 2600;
    else if (annualTaxable > 20000) annualTax = (annualTaxable - 20000) * 0.28 + 2600;
    else if (annualTaxable > 5000) annualTax = (annualTaxable - 5000) * 0.26;
    const incomeTax = parseFloat((annualTax / 12).toFixed(2));

    const retirementContribution = parseFloat((grossSalary * 0.025).toFixed(2));
    const healthInsurance = parseFloat((grossSalary * 0.018).toFixed(2));
    const totalDeductions = parseFloat((incomeTax + socialSecurity + retirementContribution + healthInsurance).toFixed(2));
    const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

    // Insert payroll record
    const result = await db.query(`
      INSERT INTO payroll (
        employee_id, pay_period_start, pay_period_end, pay_date,
        base_salary, overtime_hours, overtime_amount, bonuses, allowances, gross_salary,
        income_tax, social_security, retirement_contribution, health_insurance,
        total_deductions, net_salary, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'calculated')
      RETURNING *
    `, [employeeId, periodStart, periodEnd, payDate, baseSalary, otHours, overtimeAmount,
        bonusAmount, allowances, grossSalary, incomeTax, socialSecurity, retirementContribution,
        healthInsurance, totalDeductions, netSalary]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/payroll/:id/approve
router.patch('/:id/approve', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE payroll SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bulletin non trouvé.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/payroll/:id/pay
router.patch('/:id/pay', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE payroll SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'approved' RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bulletin non trouvé ou non approuvé.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
