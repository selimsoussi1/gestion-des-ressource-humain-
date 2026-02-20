import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function RecruitmentForm() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', departmentId: '', numberOfPositions: 1,
    salaryRangeMin: '', salaryRangeMax: '', applicationDeadline: '', priority: 'medium',
  });

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/recruitment', form);
      toast.success('Offre créée avec succès');
      navigate('/recruitment');
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
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Offre de Recrutement</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="input-field">
                <option value="">-- Sélectionner --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de postes</label>
              <input type="number" value={form.numberOfPositions} onChange={e => setForm({ ...form, numberOfPositions: e.target.value })} className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire min (TND)</label>
              <input type="number" value={form.salaryRangeMin} onChange={e => setForm({ ...form, salaryRangeMin: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire max (TND)</label>
              <input type="number" value={form.salaryRangeMax} onChange={e => setForm({ ...form, salaryRangeMax: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <input type="date" value={form.applicationDeadline} onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
                <option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field h-24" placeholder="Description du poste..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exigences</label>
            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className="input-field h-24" placeholder="Compétences et qualifications requises..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><FiSave className="w-4 h-4" /> {loading ? 'Sauvegarde...' : 'Publier l\'offre'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
