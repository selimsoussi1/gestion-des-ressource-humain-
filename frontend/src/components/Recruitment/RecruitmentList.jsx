import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiStar } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function RecruitmentList() {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recruitment').then(res => setRecruitments(res.data)).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const styles = { draft: 'bg-gray-100 text-gray-800', open: 'bg-green-100 text-green-800', in_review: 'bg-blue-100 text-blue-800', interviewing: 'bg-purple-100 text-purple-800', closed: 'bg-red-100 text-red-800', filled: 'bg-emerald-100 text-emerald-800' };
    const labels = { draft: 'Brouillon', open: 'Ouvert', in_review: 'En revue', interviewing: 'Entretiens', closed: 'Fermé', filled: 'Pourvu' };
    return <span className={`badge ${styles[status]}`}>{labels[status] || status}</span>;
  };

  const priorityBadge = (p) => {
    const styles = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };
    return <span className={`badge ${styles[p]}`}>{p}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recrutement</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des offres et candidatures</p>
        </div>
        <Link to="/recruitment/new" className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Nouvelle offre</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : recruitments.map(r => (
          <div key={r.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              {statusBadge(r.status)}
              {priorityBadge(r.priority)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{r.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{r.department_name || 'Département non défini'}</p>
            <p className="text-xs text-gray-400 line-clamp-2 mb-4">{r.description}</p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <FiUsers className="w-4 h-4" />
                <span>{r.total_candidates || 0} candidats</span>
              </div>
              <div className="text-gray-500">
                {r.number_of_positions} poste(s)
              </div>
            </div>
            {r.salary_range_min && (
              <p className="text-sm font-medium text-primary-600 mt-2">
                {parseFloat(r.salary_range_min).toLocaleString()} - {parseFloat(r.salary_range_max).toLocaleString()} TND
              </p>
            )}
            {r.application_deadline && (
              <p className="text-xs text-gray-400 mt-2">Date limite: {r.application_deadline.split('T')[0]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
