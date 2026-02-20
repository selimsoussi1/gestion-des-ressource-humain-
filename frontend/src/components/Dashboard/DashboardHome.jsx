import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiFileText, FiCalendar, FiUserPlus, FiTrendingUp, FiAlertTriangle, FiClock, FiActivity, FiBarChart2 } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import api from '../../api/axios';
import StatCard from './StatCard';
import toast from 'react-hot-toast';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/kpi'),
    ])
      .then(([statsRes, kpiRes]) => {
        setStats(statsRes.data);
        setKpi(kpiRes.data);
      })
      .catch(() => toast.error('Erreur de chargement des données'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const emp = stats.employees;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la gestion RH • {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* ============================================================ */}
      {/* KPI Cards Row 1 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employés" value={emp.total} subtitle={`${emp.active} actifs`} icon={FiUsers} color="primary" />
        <StatCard title="Masse Salariale" value={`${parseFloat(emp.total_salary_cost || 0).toLocaleString('fr-TN')} TND`} subtitle="Coût mensuel total" icon={FiDollarSign} color="green" />
        <StatCard title="Absences en attente" value={stats.pendingAbsences} subtitle="Requièrent approbation" icon={FiCalendar} color="yellow" />
        <StatCard title="Recrutements ouverts" value={stats.recruitment?.open || 0} subtitle={`${stats.recruitment?.total || 0} au total`} icon={FiUserPlus} color="blue" />
      </div>

      {/* ============================================================ */}
      {/* KPI Row 2 - Performance Indicators */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Taux de Rotation" value={`${kpi?.turnoverRate || 0}%`} subtitle="12 derniers mois" icon={FiTrendingUp} color="red" />
        <StatCard title="Ancienneté Moyenne" value={`${kpi?.avgTenure || 0} ans`} subtitle="Employés actifs" icon={FiClock} color="purple" />
        <StatCard title="Taux d'Absentéisme" value={`${kpi?.absenteeismRate || 0}%`} subtitle="Ce mois-ci" icon={FiAlertTriangle} color="orange" />
        <StatCard title="Coût Moyen/Employé" value={`${parseFloat(kpi?.avgCostPerEmployee || 0).toLocaleString('fr-TN')} TND`} subtitle="Salaire brut moyen" icon={FiActivity} color="cyan" />
      </div>

      {/* ============================================================ */}
      {/* Charts Row 1 - Main Charts */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Distribution by Department */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Effectif par Département</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.departmentDistribution} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} name="Employés" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution + Marital Status (Pie) */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Genre</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Hommes', value: parseInt(emp.male) || 0 },
                  { name: 'Femmes', value: parseInt(emp.female) || 0 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              >
                <Cell fill="#6366F1" />
                <Cell fill="#EC4899" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Charts Row 2 - Payroll & Financial */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution de la Masse Salariale</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats.payrollSummary.map(p => ({
              ...p,
              month: new Date(p.month).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
              total_gross: parseFloat(p.total_gross),
              total_net: parseFloat(p.total_net),
              total_deductions: parseFloat(p.total_deductions),
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <Tooltip formatter={(val) => `${parseFloat(val).toLocaleString('fr-TN')} TND`} />
              <Legend />
              <Area type="monotone" dataKey="total_gross" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} name="Brut" />
              <Area type="monotone" dataKey="total_net" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Net" />
              <Area type="monotone" dataKey="total_deductions" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Retenues" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des Salaires (TND)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.salaryDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Nombre d'employés">
                {stats.salaryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Charts Row 3 - Absences & Contracts */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Absence by Type - Donut */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Absences par Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.absenceStats.filter(a => parseFloat(a.total_days) > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="total_days"
                nameKey="name"
                label={({ name, value }) => `${value}j`}
              >
                {stats.absenceStats.map((a, i) => <Cell key={i} fill={a.color || COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(val) => `${val} jours`} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Contract Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Types de Contrats</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.contractDistribution}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="count"
                nameKey="contract_type"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {stats.contractDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Seniority Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ancienneté</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.seniorityDistribution}>
              <PolarGrid />
              <PolarAngleAxis dataKey="range" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar name="Employés" dataKey="count" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Charts Row 4 - Department Salary & Recruitment */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Salary Budget */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Salarial par Département</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.departmentDistribution} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <Tooltip formatter={(val) => `${parseFloat(val).toLocaleString('fr-TN')} TND`} />
              <Legend />
              <Bar dataKey="total_salary" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Masse salariale" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recruitment Pipeline */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline de Recrutement</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={[
                { stage: 'Ouvert', count: parseInt(stats.recruitment?.open) || 0 },
                { stage: 'En revue', count: parseInt(stats.recruitment?.in_review) || 0 },
                { stage: 'Entretiens', count: parseInt(stats.recruitment?.interviewing) || 0 },
                { stage: 'Pourvus', count: parseInt(stats.recruitment?.filled) || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Postes" radius={[4, 4, 0, 0]}>
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
                <Cell fill="#8B5CF6" />
                <Cell fill="#6366F1" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Quick Access & Alerts */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-2">
            <Link to="/employees/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors text-sm text-gray-700 hover:text-primary-700">
              <FiUsers className="w-5 h-5 text-primary-500" /> Ajouter un employé
            </Link>
            <Link to="/payroll/calculate" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-sm text-gray-700 hover:text-green-700">
              <FiDollarSign className="w-5 h-5 text-green-500" /> Calculer la paie
            </Link>
            <Link to="/absences/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-50 transition-colors text-sm text-gray-700 hover:text-yellow-700">
              <FiCalendar className="w-5 h-5 text-yellow-500" /> Demande d'absence
            </Link>
            <Link to="/contracts/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-700">
              <FiFileText className="w-5 h-5 text-blue-500" /> Nouveau contrat
            </Link>
            <Link to="/recruitment/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-sm text-gray-700 hover:text-purple-700">
              <FiUserPlus className="w-5 h-5 text-purple-500" /> Nouvelle offre
            </Link>
            <Link to="/reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-50 transition-colors text-sm text-gray-700 hover:text-cyan-700">
              <FiBarChart2 className="w-5 h-5 text-cyan-500" /> Voir les rapports
            </Link>
          </div>
        </div>

        {/* Expiring Contracts Alert */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-orange-500" /> Contrats qui expirent
          </h3>
          {stats.expiringContracts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiFileText className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Aucun contrat n'expire prochainement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.expiringContracts.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500">{c.employee_number}</p>
                  </div>
                  <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">{c.end_date?.split('T')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Hires */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Embauches récentes</h3>
          {stats.recentHires.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiUserPlus className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Aucune embauche récente</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.recentHires.map(h => ({
                month: new Date(h.month).toLocaleDateString('fr-FR', { month: 'short' }),
                count: parseInt(h.count),
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 4 }} name="Embauches" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
