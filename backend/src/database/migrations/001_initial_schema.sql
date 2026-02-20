-- ============================================================
-- GRH Database Schema - Initial Migration
-- Gestion des Ressources Humaines
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'hr_manager', 'hr_officer', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID,
    parent_department_id UUID REFERENCES departments(id),
    budget DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- POSITIONS / POSTES
-- ============================================================
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    description TEXT,
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EMPLOYEES / DOSSIER EMPLOYE
-- ============================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(100),
    national_id VARCHAR(50),
    social_security_number VARCHAR(50),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    number_of_children INTEGER DEFAULT 0,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Tunisie',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(30),
    
    -- Professional Information
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status VARCHAR(30) DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'terminated', 'retired')),
    employment_type VARCHAR(30) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'temporary')),
    
    -- Salary Information
    base_salary DECIMAL(12,2) DEFAULT 0,
    bank_name VARCHAR(200),
    bank_account VARCHAR(50),
    rib VARCHAR(30),
    
    -- Documents
    photo_url VARCHAR(500),
    cv_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PAYROLL PARAMETERS / PARAMETRES DE PAIE
-- ============================================================
CREATE TABLE payroll_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    param_name VARCHAR(100) NOT NULL,
    param_code VARCHAR(30) UNIQUE NOT NULL,
    param_type VARCHAR(30) CHECK (param_type IN ('earning', 'deduction', 'tax', 'contribution', 'bonus')),
    value DECIMAL(12,4) NOT NULL,
    is_percentage BOOLEAN DEFAULT false,
    description TEXT,
    effective_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PAYROLL / BULLETINS DE PAIE
-- ============================================================
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Earnings
    base_salary DECIMAL(12,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    bonuses DECIMAL(12,2) DEFAULT 0,
    allowances DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) DEFAULT 0,
    
    -- Deductions
    income_tax DECIMAL(12,2) DEFAULT 0,
    social_security DECIMAL(12,2) DEFAULT 0,
    retirement_contribution DECIMAL(12,2) DEFAULT 0,
    health_insurance DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    
    -- Net
    net_salary DECIMAL(12,2) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid', 'cancelled')),
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONTRACTS / CONTRATS DE TRAVAIL
-- ============================================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    contract_type VARCHAR(30) CHECK (contract_type IN ('CDI', 'CDD', 'stage', 'freelance', 'interim')),
    contract_number VARCHAR(50) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    probation_end_date DATE,
    salary DECIMAL(12,2) NOT NULL,
    working_hours_per_week DECIMAL(5,2) DEFAULT 40,
    terms TEXT,
    document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
    signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- RECRUITMENT / RECRUTEMENT
-- ============================================================
CREATE TABLE recruitment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirements TEXT,
    department_id UUID REFERENCES departments(id),
    number_of_positions INTEGER DEFAULT 1,
    salary_range_min DECIMAL(12,2),
    salary_range_max DECIMAL(12,2),
    application_deadline DATE,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_review', 'interviewing', 'closed', 'filled', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    posted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruitment_id UUID REFERENCES recruitment(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    cv_url VARCHAR(500),
    cover_letter TEXT,
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected', 'withdrawn')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    interview_date TIMESTAMP,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    old_position_id UUID REFERENCES positions(id),
    new_position_id UUID REFERENCES positions(id),
    old_department_id UUID REFERENCES departments(id),
    new_department_id UUID REFERENCES departments(id),
    old_salary DECIMAL(12,2),
    new_salary DECIMAL(12,2),
    effective_date DATE NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'effective')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ABSENCES
-- ============================================================
CREATE TABLE absence_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    max_days_per_year INTEGER,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    absence_type_id UUID REFERENCES absence_types(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    reason TEXT,
    document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_number ON employees(employee_number);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_absences_employee ON absences(employee_id);
CREATE INDEX idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX idx_recruitment_status ON recruitment(status);
CREATE INDEX idx_candidates_recruitment ON candidates(recruitment_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ============================================================
-- DEFAULT DATA INSERTS
-- ============================================================

-- Default Absence Types
INSERT INTO absence_types (name, code, max_days_per_year, is_paid, color) VALUES
('Congé annuel', 'ANNUAL', 30, true, '#10B981'),
('Congé maladie', 'SICK', 15, true, '#EF4444'),
('Congé maternité', 'MATERNITY', 90, true, '#8B5CF6'),
('Congé paternité', 'PATERNITY', 3, true, '#3B82F6'),
('Congé sans solde', 'UNPAID', NULL, false, '#F59E0B'),
('Congé exceptionnel', 'EXCEPTIONAL', 5, true, '#EC4899'),
('Formation', 'TRAINING', 10, true, '#06B6D4'),
('Absence injustifiée', 'UNJUSTIFIED', 0, false, '#DC2626');

-- Default Payroll Parameters (Tunisian context)
INSERT INTO payroll_parameters (param_name, param_code, param_type, value, is_percentage, description, effective_date) VALUES
('CNSS Employé', 'CNSS_EMP', 'contribution', 9.18, true, 'Cotisation CNSS part salariale', '2026-01-01'),
('CNSS Employeur', 'CNSS_EMPR', 'contribution', 16.57, true, 'Cotisation CNSS part patronale', '2026-01-01'),
('IRPP Tranche 1', 'IRPP_T1', 'tax', 0, true, 'IRPP 0-5000 TND (0%)', '2026-01-01'),
('IRPP Tranche 2', 'IRPP_T2', 'tax', 26, true, 'IRPP 5001-20000 TND (26%)', '2026-01-01'),
('IRPP Tranche 3', 'IRPP_T3', 'tax', 28, true, 'IRPP 20001-30000 TND (28%)', '2026-01-01'),
('IRPP Tranche 4', 'IRPP_T4', 'tax', 32, true, 'IRPP 30001-50000 TND (32%)', '2026-01-01'),
('IRPP Tranche 5', 'IRPP_T5', 'tax', 35, true, 'IRPP > 50000 TND (35%)', '2026-01-01'),
('Prime de transport', 'TRANSPORT', 'earning', 50, false, 'Prime de transport mensuelle', '2026-01-01'),
('Prime de présence', 'PRESENCE', 'bonus', 30, false, 'Prime de présence mensuelle', '2026-01-01'),
('SMIG', 'SMIG', 'earning', 472.584, false, 'Salaire minimum 48h/semaine', '2026-01-01');

-- Default Admin User (password: Admin@2026)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@grh.tn', '$2a$12$LJ3m4ys3Lz0Y1q4kXJP3UeQpQJGvZfXLMwjxqKdBPkVnCsRqVfVGq', 'Admin', 'Système', 'admin');

-- Default Departments
INSERT INTO departments (name, code, description) VALUES
('Direction Générale', 'DG', 'Direction générale de l''entreprise'),
('Ressources Humaines', 'RH', 'Département des ressources humaines'),
('Informatique', 'IT', 'Département informatique et systèmes d''information'),
('Finance', 'FIN', 'Département financier et comptabilité'),
('Commercial', 'COM', 'Département commercial et ventes'),
('Production', 'PROD', 'Département de production'),
('Logistique', 'LOG', 'Département logistique et approvisionnement'),
('Qualité', 'QUA', 'Département qualité et conformité');

-- Default Positions
INSERT INTO positions (title, code, department_id, min_salary, max_salary) VALUES
('Directeur Général', 'DG001', (SELECT id FROM departments WHERE code='DG'), 5000, 15000),
('Responsable RH', 'RH001', (SELECT id FROM departments WHERE code='RH'), 3000, 6000),
('Chargé de recrutement', 'RH002', (SELECT id FROM departments WHERE code='RH'), 1500, 3000),
('Développeur Full Stack', 'IT001', (SELECT id FROM departments WHERE code='IT'), 2000, 5000),
('Chef de projet IT', 'IT002', (SELECT id FROM departments WHERE code='IT'), 3000, 6000),
('Comptable', 'FIN001', (SELECT id FROM departments WHERE code='FIN'), 1500, 3500),
('Directeur Financier', 'FIN002', (SELECT id FROM departments WHERE code='FIN'), 4000, 8000),
('Commercial', 'COM001', (SELECT id FROM departments WHERE code='COM'), 1200, 3000),
('Responsable Production', 'PROD01', (SELECT id FROM departments WHERE code='PROD'), 2500, 5000),
('Technicien Qualité', 'QUA001', (SELECT id FROM departments WHERE code='QUA'), 1500, 3000);

-- Sample Employees
INSERT INTO employees (employee_number, first_name, last_name, date_of_birth, gender, nationality, national_id, marital_status, number_of_children, email, phone, address, city, department_id, position_id, hire_date, employment_status, employment_type, base_salary) VALUES
('EMP001', 'Ahmed', 'Ben Ali', '1985-03-15', 'male', 'Tunisienne', '08123456', 'married', 2, 'ahmed.benali@company.tn', '+216 71 123 456', '15 Rue de la Liberté', 'Tunis', (SELECT id FROM departments WHERE code='DG'), (SELECT id FROM positions WHERE code='DG001'), '2018-01-15', 'active', 'full_time', 8000),
('EMP002', 'Fatma', 'Trabelsi', '1990-07-22', 'female', 'Tunisienne', '08654321', 'single', 0, 'fatma.trabelsi@company.tn', '+216 71 654 321', '22 Avenue Habib Bourguiba', 'Sfax', (SELECT id FROM departments WHERE code='RH'), (SELECT id FROM positions WHERE code='RH001'), '2019-06-01', 'active', 'full_time', 4500),
('EMP003', 'Mohamed', 'Gharbi', '1992-11-08', 'male', 'Tunisienne', '08789012', 'married', 1, 'mohamed.gharbi@company.tn', '+216 71 789 012', '8 Rue Ibn Khaldoun', 'Sousse', (SELECT id FROM departments WHERE code='IT'), (SELECT id FROM positions WHERE code='IT001'), '2020-03-15', 'active', 'full_time', 3500),
('EMP004', 'Amira', 'Hamdi', '1988-05-30', 'female', 'Tunisienne', '08345678', 'married', 3, 'amira.hamdi@company.tn', '+216 71 345 678', '45 Rue de Carthage', 'Tunis', (SELECT id FROM departments WHERE code='FIN'), (SELECT id FROM positions WHERE code='FIN002'), '2017-09-01', 'active', 'full_time', 5500),
('EMP005', 'Youssef', 'Mansouri', '1995-01-12', 'male', 'Tunisienne', '08901234', 'single', 0, 'youssef.mansouri@company.tn', '+216 71 901 234', '12 Avenue de la République', 'Bizerte', (SELECT id FROM departments WHERE code='COM'), (SELECT id FROM positions WHERE code='COM001'), '2022-01-10', 'active', 'full_time', 1800),
('EMP006', 'Salma', 'Khediri', '1993-09-18', 'female', 'Tunisienne', '08567890', 'single', 0, 'salma.khediri@company.tn', '+216 71 567 890', '30 Rue de Monastir', 'Monastir', (SELECT id FROM departments WHERE code='IT'), (SELECT id FROM positions WHERE code='IT002'), '2019-11-15', 'active', 'full_time', 4200),
('EMP007', 'Karim', 'Bouazizi', '1987-12-05', 'male', 'Tunisienne', '08234567', 'married', 2, 'karim.bouazizi@company.tn', '+216 71 234 567', '5 Rue de Kairouan', 'Kairouan', (SELECT id FROM departments WHERE code='PROD'), (SELECT id FROM positions WHERE code='PROD01'), '2016-04-20', 'active', 'full_time', 3800),
('EMP008', 'Nour', 'Ayari', '1991-06-25', 'female', 'Tunisienne', '08678901', 'married', 1, 'nour.ayari@company.tn', '+216 71 678 901', '18 Avenue Farhat Hached', 'Gabès', (SELECT id FROM departments WHERE code='QUA'), (SELECT id FROM positions WHERE code='QUA001'), '2021-02-01', 'active', 'full_time', 2200),
('EMP009', 'Slim', 'Chtioui', '1994-04-14', 'male', 'Tunisienne', '08456789', 'single', 0, 'slim.chtioui@company.tn', '+216 71 456 789', '7 Rue de Nabeul', 'Nabeul', (SELECT id FROM departments WHERE code='RH'), (SELECT id FROM positions WHERE code='RH002'), '2023-03-01', 'active', 'contract', 2000),
('EMP010', 'Ines', 'Maalej', '1996-08-09', 'female', 'Tunisienne', '08890123', 'single', 0, 'ines.maalej@company.tn', '+216 71 890 123', '25 Rue de Djerba', 'Médenine', (SELECT id FROM departments WHERE code='FIN'), (SELECT id FROM positions WHERE code='FIN001'), '2024-06-15', 'active', 'full_time', 1800);

-- Sample Contracts
INSERT INTO contracts (employee_id, contract_type, contract_number, start_date, salary, status) 
SELECT id, 'CDI', 'CTR-' || employee_number, hire_date, base_salary, 'active' FROM employees;

-- Sample Recruitment
INSERT INTO recruitment (title, description, department_id, number_of_positions, salary_range_min, salary_range_max, application_deadline, status, priority) VALUES
('Développeur React Senior', 'Nous recherchons un développeur React expérimenté pour rejoindre notre équipe IT.', (SELECT id FROM departments WHERE code='IT'), 2, 3000, 5000, '2026-04-01', 'open', 'high'),
('Comptable Junior', 'Poste de comptable junior pour le département finance.', (SELECT id FROM departments WHERE code='FIN'), 1, 1500, 2500, '2026-03-15', 'open', 'medium'),
('Responsable Qualité', 'Responsable qualité pour superviser les processus de conformité.', (SELECT id FROM departments WHERE code='QUA'), 1, 3000, 4500, '2026-05-01', 'draft', 'low');

-- Sample Absences
INSERT INTO absences (employee_id, absence_type_id, start_date, end_date, total_days, reason, status) VALUES
((SELECT id FROM employees WHERE employee_number='EMP001'), (SELECT id FROM absence_types WHERE code='ANNUAL'), '2026-01-05', '2026-01-09', 5, 'Vacances familiales', 'approved'),
((SELECT id FROM employees WHERE employee_number='EMP003'), (SELECT id FROM absence_types WHERE code='SICK'), '2026-02-10', '2026-02-12', 3, 'Grippe', 'approved'),
((SELECT id FROM employees WHERE employee_number='EMP005'), (SELECT id FROM absence_types WHERE code='TRAINING'), '2026-02-15', '2026-02-19', 5, 'Formation React avancé', 'approved'),
((SELECT id FROM employees WHERE employee_number='EMP002'), (SELECT id FROM absence_types WHERE code='ANNUAL'), '2026-03-01', '2026-03-05', 5, 'Congé personnel', 'pending'),
((SELECT id FROM employees WHERE employee_number='EMP007'), (SELECT id FROM absence_types WHERE code='EXCEPTIONAL'), '2026-01-20', '2026-01-21', 2, 'Mariage famille', 'approved');

-- Sample Payroll Records
INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, pay_date, base_salary, overtime_hours, overtime_amount, bonuses, allowances, gross_salary, income_tax, social_security, retirement_contribution, health_insurance, total_deductions, net_salary, status) VALUES
((SELECT id FROM employees WHERE employee_number='EMP001'), '2026-01-01', '2026-01-31', '2026-01-28', 8000, 0, 0, 500, 80, 8580, 1500, 787.24, 200, 150, 2637.24, 5942.76, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP002'), '2026-01-01', '2026-01-31', '2026-01-28', 4500, 5, 140.63, 200, 80, 4920.63, 650, 451.71, 100, 80, 1281.71, 3638.92, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP003'), '2026-01-01', '2026-01-31', '2026-01-28', 3500, 10, 218.75, 150, 80, 3948.75, 450, 362.49, 80, 60, 952.49, 2996.26, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP004'), '2026-01-01', '2026-01-31', '2026-01-28', 5500, 0, 0, 300, 80, 5880, 900, 539.78, 120, 100, 1659.78, 4220.22, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP005'), '2026-01-01', '2026-01-31', '2026-01-28', 1800, 8, 90.00, 100, 80, 2070, 150, 190.03, 40, 30, 410.03, 1659.97, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP001'), '2026-02-01', '2026-02-28', '2026-02-26', 8000, 5, 312.50, 600, 80, 8992.50, 1600, 825.11, 200, 150, 2775.11, 6217.39, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP002'), '2026-02-01', '2026-02-28', '2026-02-26', 4500, 0, 0, 200, 80, 4780, 630, 438.80, 100, 80, 1248.80, 3531.20, 'paid'),
((SELECT id FROM employees WHERE employee_number='EMP003'), '2026-02-01', '2026-02-28', '2026-02-26', 3500, 0, 0, 150, 80, 3730, 400, 342.41, 80, 60, 882.41, 2847.59, 'paid');
