import { useState, useEffect } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>;
  if (!stats) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Déclarations</h1>
          <p className="text-sm text-gray-500 mt-1">Éditions et analyses RH</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><FiPrinter className="w-4 h-4" /> Imprimer</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary by Department */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Masse salariale par département</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.departmentDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => `${parseFloat(val).toLocaleString('fr-TN')} TND`} />
              <Bar dataKey="total_salary" fill="#6366F1" radius={[4, 4, 0, 0]} name="Total salaire" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contract Types */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des contrats</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.contractDistribution} dataKey="count" nameKey="contract_type" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {stats.contractDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des salaires</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.salaryDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Employés" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Absences by Type */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Absences par type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.absenceStats.filter(a => parseFloat(a.total_days) > 0)} dataKey="total_days" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}j`}>
                {stats.absenceStats.map((a, i) => <Cell key={i} fill={a.color || COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expiring Contracts */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contrats expirant dans les 30 prochains jours</h3>
          {stats.expiringContracts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Aucun contrat n'expire prochainement.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Employé</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Date fin</th>
                </tr></thead>
                <tbody>
                  {stats.expiringContracts.map(c => (
                    <tr key={c.id} className="border-t">
                      <td className="px-4 py-2 text-sm">{c.first_name} {c.last_name} ({c.employee_number})</td>
                      <td className="px-4 py-2 text-sm">{c.contract_type}</td>
                      <td className="px-4 py-2 text-sm text-red-600 font-medium">{c.end_date?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
