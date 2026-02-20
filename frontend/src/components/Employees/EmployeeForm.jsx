import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', nationality: 'Tunisienne',
    nationalId: '', socialSecurityNumber: '', maritalStatus: '', numberOfChildren: 0,
    email: '', phone: '', address: '', city: '', postalCode: '', country: 'Tunisie',
    emergencyContactName: '', emergencyContactPhone: '', departmentId: '', positionId: '',
    hireDate: '', employmentType: 'full_time', baseSalary: '', bankName: '', bankAccount: '', rib: '',
  });

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data)).catch(() => {});
    if (isEdit) {
      api.get(`/employees/${id}`).then(res => {
        const e = res.data;
        setForm({
          firstName: e.first_name || '', lastName: e.last_name || '', dateOfBirth: e.date_of_birth?.split('T')[0] || '',
          gender: e.gender || '', nationality: e.nationality || '', nationalId: e.national_id || '',
          socialSecurityNumber: e.social_security_number || '', maritalStatus: e.marital_status || '',
          numberOfChildren: e.number_of_children || 0, email: e.email || '', phone: e.phone || '',
          address: e.address || '', city: e.city || '', postalCode: e.postal_code || '', country: e.country || 'Tunisie',
          emergencyContactName: e.emergency_contact_name || '', emergencyContactPhone: e.emergency_contact_phone || '',
          departmentId: e.department_id || '', positionId: e.position_id || '', hireDate: e.hire_date?.split('T')[0] || '',
          employmentType: e.employment_type || 'full_time', baseSalary: e.base_salary || '',
          bankName: e.bank_name || '', bankAccount: e.bank_account || '', rib: e.rib || '',
        });
      }).catch(() => toast.error('Employé non trouvé'));
    }
  }, [id]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, form);
        toast.success('Employé mis à jour avec succès');
      } else {
        await api.post('/employees', form);
        toast.success('Employé créé avec succès');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange} className="input-field" required={required} {...props} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Prénom" name="firstName" required />
            <Field label="Nom" name="lastName" required />
            <Field label="Date de naissance" name="dateOfBirth" type="date" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="">-- Sélectionner --</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
            </div>
            <Field label="Nationalité" name="nationality" />
            <Field label="CIN" name="nationalId" />
            <Field label="N° Sécurité Sociale" name="socialSecurityNumber" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
              <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="input-field">
                <option value="">-- Sélectionner --</option>
                <option value="single">Célibataire</option>
                <option value="married">Marié(e)</option>
                <option value="divorced">Divorcé(e)</option>
                <option value="widowed">Veuf/Veuve</option>
              </select>
            </div>
            <Field label="Nombre d'enfants" name="numberOfChildren" type="number" min="0" />
          </div>
        </div>

        {/* Contact */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Email" name="email" type="email" />
            <Field label="Téléphone" name="phone" />
            <Field label="Adresse" name="address" />
            <Field label="Ville" name="city" />
            <Field label="Code postal" name="postalCode" />
            <Field label="Pays" name="country" />
            <Field label="Contact d'urgence" name="emergencyContactName" />
            <Field label="Tél. urgence" name="emergencyContactPhone" />
          </div>
        </div>

        {/* Professional */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations professionnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange} className="input-field">
                <option value="">-- Sélectionner --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Field label="Date d'embauche" name="hireDate" type="date" required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'emploi</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className="input-field">
                <option value="full_time">Temps plein</option>
                <option value="part_time">Temps partiel</option>
                <option value="contract">Contrat</option>
                <option value="intern">Stagiaire</option>
                <option value="temporary">Temporaire</option>
              </select>
            </div>
            <Field label="Salaire de base (TND)" name="baseSalary" type="number" step="0.01" />
          </div>
        </div>

        {/* Banking */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations bancaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Banque" name="bankName" />
            <Field label="N° Compte" name="bankAccount" />
            <Field label="RIB" name="rib" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}
