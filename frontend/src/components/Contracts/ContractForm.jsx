import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ContractForm() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', contractType: 'CDI', contractNumber: '', startDate: '', endDate: '', probationEndDate: '', salary: '', workingHoursPerWeek: 40, terms: '',
  });

  useEffect(() => {
    api.get('/employees', { params: { limit: 100 } }).then(res => setEmployees(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contracts', form);
      toast.success('Contrat créé avec succès');
      navigate('/contracts');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau Contrat</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employé *</label>
              <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="input-field" required>
                <option value="">-- Sélectionner --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.employee_number} - {e.first_name} {e.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
              <select value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value })} className="input-field">
                <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="stage">Stage</option>
                <option value="freelance">Freelance</option><option value="interim">Intérim</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Contrat</label>
              <input type="text" value={form.contractNumber} onChange={e => setForm({ ...form, contractNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (TND) *</label>
              <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="input-field" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin période d'essai</label>
              <input type="date" value={form.probationEndDate} onChange={e => setForm({ ...form, probationEndDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heures/semaine</label>
              <input type="number" value={form.workingHoursPerWeek} onChange={e => setForm({ ...form, workingHoursPerWeek: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
            <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} className="input-field h-24" placeholder="Conditions du contrat..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><FiSave className="w-4 h-4" /> {loading ? 'Sauvegarde...' : 'Créer contrat'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
