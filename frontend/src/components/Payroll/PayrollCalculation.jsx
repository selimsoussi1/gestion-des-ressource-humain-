import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PayrollCalculation() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    employeeId: '', periodStart: '', periodEnd: '', payDate: '', overtimeHours: 0, bonuses: 0,
  });

  useEffect(() => {
    api.get('/employees', { params: { limit: 100 } }).then(res => setEmployees(res.data.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/payroll/calculate', form);
      setResult(data);
      toast.success('Bulletin de paie calculé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur de calcul');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">Calcul automatique de la Paie</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres de calcul</h2>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employé *</label>
              <select name="employeeId" value={form.employeeId} onChange={handleChange} className="input-field" required>
                <option value="">-- Sélectionner un employé --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.employee_number} - {e.first_name} {e.last_name} ({parseFloat(e.base_salary).toLocaleString()} TND)</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Début période *</label>
                <input type="date" name="periodStart" value={form.periodStart} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin période *</label>
                <input type="date" name="periodEnd" value={form.periodEnd} onChange={handleChange} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
              <input type="date" name="payDate" value={form.payDate} onChange={handleChange} className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heures supplémentaires</label>
                <input type="number" name="overtimeHours" value={form.overtimeHours} onChange={handleChange} className="input-field" min="0" step="0.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primes (TND)</label>
                <input type="number" name="bonuses" value={form.bonuses} onChange={handleChange} className="input-field" min="0" step="0.01" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              <FiDollarSign className="w-5 h-5" /> {loading ? 'Calcul en cours...' : 'Calculer le bulletin'}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Résultat du calcul</h2>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Gains</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Salaire de base</span><span className="font-medium">{parseFloat(result.base_salary).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>Heures sup. ({result.overtime_hours}h)</span><span className="font-medium">{parseFloat(result.overtime_amount).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>Primes</span><span className="font-medium">{parseFloat(result.bonuses).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>Indemnités</span><span className="font-medium">{parseFloat(result.allowances).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Salaire Brut</span><span className="text-blue-700">{parseFloat(result.gross_salary).toLocaleString('fr-TN')} TND</span></div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="text-sm font-semibold text-red-700 mb-2">Retenues</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>IRPP</span><span className="font-medium">-{parseFloat(result.income_tax).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>CNSS</span><span className="font-medium">-{parseFloat(result.social_security).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>Retraite</span><span className="font-medium">-{parseFloat(result.retirement_contribution).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between"><span>Assurance maladie</span><span className="font-medium">-{parseFloat(result.health_insurance).toLocaleString('fr-TN')} TND</span></div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total retenues</span><span className="text-red-700">-{parseFloat(result.total_deductions).toLocaleString('fr-TN')} TND</span></div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-800">Salaire Net</span>
                  <span className="text-2xl font-bold text-green-700">{parseFloat(result.net_salary).toLocaleString('fr-TN')} TND</span>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/payroll')} className="w-full btn-success mt-4">Voir les bulletins</button>
          </div>
        )}
      </div>
    </div>
  );
}
