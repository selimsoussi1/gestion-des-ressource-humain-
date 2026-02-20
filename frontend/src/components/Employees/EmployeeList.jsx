import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await api.get('/employees', { params });
      setEmployees(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(currentPage); }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees(1);
  };

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    const labels = { active: 'Actif', on_leave: 'En congé', terminated: 'Terminé', suspended: 'Suspendu' };
    return <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} employés au total</p>
        </div>
        <Link to="/employees/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Nouvel employé
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, numéro ou email..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Rechercher</button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nom complet</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Département</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Poste</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Salaire</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-gray-500">Aucun employé trouvé</td></tr>
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{emp.employee_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-700">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.department_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.position_title || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{parseFloat(emp.base_salary).toLocaleString('fr-TN')} TND</td>
                  <td className="px-6 py-4">{statusBadge(emp.employment_status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/employees/${emp.id}`} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Voir">
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link to={`/employees/${emp.id}/edit`} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Modifier">
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Page {pagination.page} sur {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary text-sm disabled:opacity-50">Précédent</button>
              <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="btn-secondary text-sm disabled:opacity-50">Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
