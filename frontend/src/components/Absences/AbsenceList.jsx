import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AbsenceList() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAbsences = () => {
    api.get('/absences', { params: { limit: 50 } })
      .then(res => setAbsences(res.data.data))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAbsences(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/absences/${id}/approve`);
      toast.success('Absence approuvée');
      fetchAbsences();
    } catch { toast.error('Erreur'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/absences/${id}/reject`);
      toast.success('Absence rejetée');
      fetchAbsences();
    } catch { toast.error('Erreur'); }
  };

  const statusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' };
    const labels = { pending: 'En attente', approved: 'Approuvée', rejected: 'Refusée', cancelled: 'Annulée' };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Absences</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi des congés et absences</p>
        </div>
        <Link to="/absences/new" className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Nouvelle absence</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Employé</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Du</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Au</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Jours</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Motif</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : absences.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{a.first_name} {a.last_name}</p>
                    <p className="text-xs text-gray-500">{a.employee_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge" style={{ backgroundColor: a.type_color + '20', color: a.type_color }}>{a.type_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.start_date?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.end_date?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-sm font-medium text-center">{a.total_days}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-48 truncate">{a.reason || '-'}</td>
                  <td className="px-6 py-4 text-center">{statusBadge(a.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {a.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleApprove(a.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Approuver"><FiCheck className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(a.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Refuser"><FiX className="w-4 h-4" /></button>
                      </div>
                    )}
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
