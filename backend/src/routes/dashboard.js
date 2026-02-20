const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/stats - Main dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Total employees by status
    const empStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN employment_status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN employment_status = 'on_leave' THEN 1 END) as on_leave,
        COUNT(CASE WHEN employment_status = 'terminated' THEN 1 END) as terminated,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female,
        AVG(base_salary) as avg_salary,
        SUM(base_salary) as total_salary_cost
      FROM employees
    `);

    // Department distribution
    const deptDist = await db.query(`
      SELECT d.name, COUNT(e.id) as count, COALESCE(SUM(e.base_salary), 0) as total_salary
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'active'
      WHERE d.is_active = true
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `);

    // Recent hires (last 6 months)
    const recentHires = await db.query(`
      SELECT DATE_TRUNC('month', hire_date) as month, COUNT(*) as count
      FROM employees
      WHERE hire_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `);

    // Payroll summary (last 6 months)
    const payrollSummary = await db.query(`
      SELECT DATE_TRUNC('month', pay_period_start) as month,
        SUM(gross_salary) as total_gross,
        SUM(net_salary) as total_net,
        SUM(total_deductions) as total_deductions,
        COUNT(*) as payslip_count
      FROM payroll
      WHERE pay_period_start >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `);

    // Absence statistics
    const absenceStats = await db.query(`
      SELECT at.name, at.color, COUNT(a.id) as count, COALESCE(SUM(a.total_days), 0) as total_days
      FROM absence_types at
      LEFT JOIN absences a ON at.id = a.absence_type_id AND a.status = 'approved'
        AND a.start_date >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY at.id, at.name, at.color
      ORDER BY total_days DESC
    `);

    // Pending absences count
    const pendingAbsences = await db.query(`
      SELECT COUNT(*) as count FROM absences WHERE status = 'pending'
    `);

    // Active recruitments
    const recruitmentStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review,
        COUNT(CASE WHEN status = 'interviewing' THEN 1 END) as interviewing,
        COUNT(CASE WHEN status = 'filled' THEN 1 END) as filled
      FROM recruitment
    `);

    // Contract distribution
    const contractDist = await db.query(`
      SELECT contract_type, COUNT(*) as count
      FROM contracts
      WHERE status = 'active'
      GROUP BY contract_type
      ORDER BY count DESC
    `);

    // Contracts expiring within 30 days
    const expiringContracts = await db.query(`
      SELECT c.*, e.first_name, e.last_name, e.employee_number
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      WHERE c.status = 'active' AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY c.end_date
    `);

    // Salary distribution by range
    const salaryDist = await db.query(`
      SELECT 
        CASE 
          WHEN base_salary < 1500 THEN '< 1500'
          WHEN base_salary BETWEEN 1500 AND 2500 THEN '1500-2500'
          WHEN base_salary BETWEEN 2501 AND 4000 THEN '2501-4000'
          WHEN base_salary BETWEEN 4001 AND 6000 THEN '4001-6000'
          ELSE '> 6000'
        END as range,
        COUNT(*) as count
      FROM employees WHERE employment_status = 'active'
      GROUP BY range
      ORDER BY range
    `);

    // Seniority distribution
    const seniorityDist = await db.query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 1 THEN '< 1 an'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) BETWEEN 1 AND 3 THEN '1-3 ans'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) BETWEEN 4 AND 7 THEN '4-7 ans'
          ELSE '> 7 ans'
        END as range,
        COUNT(*) as count
      FROM employees WHERE employment_status = 'active'
      GROUP BY range
    `);

    res.json({
      employees: empStats.rows[0],
      departmentDistribution: deptDist.rows,
      recentHires: recentHires.rows,
      payrollSummary: payrollSummary.rows,
      absenceStats: absenceStats.rows,
      pendingAbsences: parseInt(pendingAbsences.rows[0].count),
      recruitment: recruitmentStats.rows[0],
      contractDistribution: contractDist.rows,
      expiringContracts: expiringContracts.rows,
      salaryDistribution: salaryDist.rows,
      seniorityDistribution: seniorityDist.rows,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/kpi - Key Performance Indicators
router.get('/kpi', async (req, res, next) => {
  try {
    const turnoverRate = await db.query(`
      SELECT 
        (COUNT(CASE WHEN employment_status = 'terminated' AND termination_date >= CURRENT_DATE - INTERVAL '12 months' THEN 1 END)::FLOAT / 
         NULLIF(COUNT(CASE WHEN employment_status = 'active' THEN 1 END), 0) * 100) as rate
      FROM employees
    `);

    const avgTenure = await db.query(`
      SELECT AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date))) as years
      FROM employees WHERE employment_status = 'active'
    `);

    const absenteeismRate = await db.query(`
      SELECT 
        (COALESCE(SUM(total_days), 0)::FLOAT / 
         NULLIF((SELECT COUNT(*) FROM employees WHERE employment_status = 'active') * 22, 0) * 100) as rate
      FROM absences
      WHERE status = 'approved' 
        AND start_date >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    const costPerEmployee = await db.query(`
      SELECT COALESCE(AVG(gross_salary), 0) as avg_cost
      FROM payroll
      WHERE pay_period_start >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    `);

    res.json({
      turnoverRate: parseFloat(turnoverRate.rows[0].rate || 0).toFixed(1),
      avgTenure: parseFloat(avgTenure.rows[0].years || 0).toFixed(1),
      absenteeismRate: parseFloat(absenteeismRate.rows[0].rate || 0).toFixed(1),
      avgCostPerEmployee: parseFloat(costPerEmployee.rows[0].avg_cost || 0).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
