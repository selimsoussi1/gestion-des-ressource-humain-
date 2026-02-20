import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contracts', { params: { limit: 50 } })
      .then(res => setContracts(res.data.data))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const typeBadge = (type) => {
    const colors = { CDI: 'bg-green-100 text-green-800', CDD: 'bg-blue-100 text-blue-800', stage: 'bg-purple-100 text-purple-800', freelance: 'bg-orange-100 text-orange-800', interim: 'bg-yellow-100 text-yellow-800' };
    return <span className={`badge ${colors[type] || 'bg-gray-100 text-gray-800'}`}>{type}</span>;
  };

  const statusBadge = (status) => {
    const colors = { active: 'bg-green-100 text-green-800', expired: 'bg-red-100 text-red-800', terminated: 'bg-gray-100 text-gray-800', draft: 'bg-yellow-100 text-yellow-800' };
    return <span className={`badge ${colors[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats de Travail</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des contrats et promotions</p>
        </div>
        <Link to="/contracts/new" className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Nouveau contrat</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">N° Contrat</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Employé</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Date début</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Date fin</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Salaire</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : contracts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{c.contract_number || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.first_name} {c.last_name} <span className="text-gray-500 text-xs">({c.employee_number})</span></td>
                  <td className="px-6 py-4 text-center">{typeBadge(c.contract_type)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.start_date?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.end_date?.split('T')[0] || 'Indéterminée'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{parseFloat(c.salary).toLocaleString('fr-TN')} TND</td>
                  <td className="px-6 py-4 text-center">{statusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
