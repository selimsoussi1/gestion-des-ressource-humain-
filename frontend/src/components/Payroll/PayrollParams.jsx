import { useState, useEffect } from 'react';
import { FiPlus, FiSave } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PayrollParams() {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ paramName: '', paramCode: '', paramType: 'earning', value: '', isPercentage: false, description: '', effectiveDate: '' });

  const fetchParams = () => {
    api.get('/payroll/parameters').then(res => setParams(res.data)).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchParams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll/parameters', form);
      toast.success('Paramètre ajouté');
      setShowForm(false);
      setForm({ paramName: '', paramCode: '', paramType: 'earning', value: '', isPercentage: false, description: '', effectiveDate: '' });
      fetchParams();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
  };

  const typeColors = { earning: 'bg-green-100 text-green-800', deduction: 'bg-red-100 text-red-800', tax: 'bg-orange-100 text-orange-800', contribution: 'bg-blue-100 text-blue-800', bonus: 'bg-purple-100 text-purple-800' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de Paie</h1>
          <p className="text-sm text-gray-500 mt-1">Configuration des taux, cotisations et primes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Ajouter</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau paramètre</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Nom" value={form.paramName} onChange={e => setForm({ ...form, paramName: e.target.value })} className="input-field" required />
            <input type="text" placeholder="Code" value={form.paramCode} onChange={e => setForm({ ...form, paramCode: e.target.value })} className="input-field" required />
            <select value={form.paramType} onChange={e => setForm({ ...form, paramType: e.target.value })} className="input-field">
              <option value="earning">Gain</option><option value="deduction">Retenue</option><option value="tax">Impôt</option>
              <option value="contribution">Cotisation</option><option value="bonus">Prime</option>
            </select>
            <input type="number" placeholder="Valeur" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="input-field" step="0.01" required />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPercentage} onChange={e => setForm({ ...form, isPercentage: e.target.checked })} className="w-4 h-4" /> Pourcentage (%)</label>
            <input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} className="input-field" required />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field md:col-span-2" />
            <button type="submit" className="btn-primary flex items-center justify-center gap-2"><FiSave className="w-4 h-4" /> Sauvegarder</button>
          </form>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nom</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Code</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Valeur</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {params.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.param_name}</td>
                <td className="px-6 py-3 text-sm font-mono text-gray-600">{p.param_code}</td>
                <td className="px-6 py-3"><span className={`badge ${typeColors[p.param_type]}`}>{p.param_type}</span></td>
                <td className="px-6 py-3 text-sm font-medium text-right">{p.value}{p.is_percentage ? '%' : ' TND'}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
