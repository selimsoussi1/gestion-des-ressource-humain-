import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AbsenceForm() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [absenceTypes, setAbsenceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', absenceTypeId: '', startDate: '', endDate: '', totalDays: '', reason: '',
  });

  useEffect(() => {
    api.get('/employees', { params: { limit: 100 } }).then(res => setEmployees(res.data.data)).catch(() => {});
    api.get('/absences/types').then(res => setAbsenceTypes(res.data)).catch(() => {});
  }, []);

  // Auto-calculate days
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) setForm(prev => ({ ...prev, totalDays: diff }));
    }
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/absences', form);
      toast.success('Demande d\'absence créée');
      navigate('/absences');
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
        <h1 className="text-2xl font-bold text-gray-900">Demande d'Absence</h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employé *</label>
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="input-field" required>
              <option value="">-- Sélectionner --</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employee_number} - {e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'absence *</label>
            <select value={form.absenceTypeId} onChange={e => setForm({ ...form, absenceTypeId: e.target.value })} className="input-field" required>
              <option value="">-- Sélectionner --</option>
              {absenceTypes.map(t => <option key={t.id} value={t.id}>{t.name} {t.max_days_per_year ? `(max ${t.max_days_per_year}j/an)` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de jours</label>
              <input type="number" value={form.totalDays} onChange={e => setForm({ ...form, totalDays: e.target.value })} className="input-field" readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input-field h-24" placeholder="Raison de l'absence..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><FiSave className="w-4 h-4" /> {loading ? 'Envoi...' : 'Soumettre la demande'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
