import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payroll', { params: { limit: 50 } })
      .then(res => setPayrolls(res.data.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const styles = { draft: 'bg-gray-100 text-gray-800', calculated: 'bg-blue-100 text-blue-800', approved: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    const labels = { draft: 'Brouillon', calculated: 'Calculé', approved: 'Approuvé', paid: 'Payé', cancelled: 'Annulé' };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/payroll/${id}/approve`);
      toast.success('Bulletin approuvé');
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch { toast.error('Erreur'); }
  };

  const handlePay = async (id) => {
    try {
      await api.patch(`/payroll/${id}/pay`);
      toast.success('Bulletin marqué comme payé');
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
    } catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulletins de Paie</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion et suivi des bulletins de salaire</p>
        </div>
        <div className="flex gap-2">
          <Link to="/payroll/parameters" className="btn-secondary text-sm">Paramètres</Link>
          <Link to="/payroll/calculate" className="btn-primary flex items-center gap-2"><FiDollarSign className="w-4 h-4" /> Calculer Paie</Link>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Employé</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Période</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Brut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Déductions</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Net</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">{p.employee_number} • {p.department_name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.pay_period_start?.split('T')[0]} → {p.pay_period_end?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{parseFloat(p.gross_salary).toLocaleString('fr-TN')} TND</td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right">-{parseFloat(p.total_deductions).toLocaleString('fr-TN')} TND</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-700 text-right">{parseFloat(p.net_salary).toLocaleString('fr-TN')} TND</td>
                  <td className="px-6 py-4 text-center">{statusBadge(p.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {p.status === 'calculated' && (
                        <button onClick={() => handleApprove(p.id)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Approuver"><FiCheckCircle className="w-4 h-4" /></button>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => handlePay(p.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Marquer payé"><FiDollarSign className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
