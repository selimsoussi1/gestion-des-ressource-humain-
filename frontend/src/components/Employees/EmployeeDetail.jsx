import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/employees/${id}`)
      .then(res => setEmployee(res.data))
      .catch(() => { toast.error('Employé non trouvé'); navigate('/employees'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (!employee) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold text-gray-900">Dossier Employé</h1>
        </div>
        <Link to={`/employees/${id}/edit`} className="btn-primary flex items-center gap-2">
          <FiEdit2 className="w-4 h-4" /> Modifier
        </Link>
      </div>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-700">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
            <p className="text-sm text-gray-500">{employee.position_title || 'Poste non défini'} • {employee.department_name || '-'}</p>
            <p className="text-xs text-gray-400 mt-1 font-mono">{employee.employee_number}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`badge ${employee.employment_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {employee.employment_status === 'active' ? 'Actif' : employee.employment_status}
              </span>
              <span className="badge bg-blue-100 text-blue-800">{employee.employment_type === 'full_time' ? 'Temps plein' : employee.employment_type}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">{parseFloat(employee.base_salary).toLocaleString('fr-TN')} TND</p>
            <p className="text-xs text-gray-500">Salaire mensuel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
          <InfoRow icon={FiCalendar} label="Date de naissance" value={employee.date_of_birth?.split('T')[0]} />
          <InfoRow icon={FiBriefcase} label="Genre" value={employee.gender === 'male' ? 'Homme' : 'Femme'} />
          <InfoRow icon={FiBriefcase} label="Nationalité" value={employee.nationality} />
          <InfoRow icon={FiBriefcase} label="CIN" value={employee.national_id} />
          <InfoRow icon={FiBriefcase} label="Situation familiale" value={employee.marital_status} />
          <InfoRow icon={FiBriefcase} label="Enfants" value={employee.number_of_children} />
        </div>

        {/* Contact */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact</h3>
          <InfoRow icon={FiMail} label="Email" value={employee.email} />
          <InfoRow icon={FiPhone} label="Téléphone" value={employee.phone} />
          <InfoRow icon={FiMapPin} label="Adresse" value={`${employee.address || ''}, ${employee.city || ''} ${employee.postal_code || ''}`} />
          <InfoRow icon={FiPhone} label="Contact d'urgence" value={`${employee.emergency_contact_name || '-'} (${employee.emergency_contact_phone || '-'})`} />
        </div>

        {/* Professional */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations professionnelles</h3>
          <InfoRow icon={FiCalendar} label="Date d'embauche" value={employee.hire_date?.split('T')[0]} />
          <InfoRow icon={FiBriefcase} label="Département" value={employee.department_name} />
          <InfoRow icon={FiBriefcase} label="Poste" value={employee.position_title} />
          <InfoRow icon={FiDollarSign} label="Salaire de base" value={`${parseFloat(employee.base_salary).toLocaleString('fr-TN')} TND`} />
        </div>

        {/* Banking */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations bancaires</h3>
          <InfoRow icon={FiDollarSign} label="Banque" value={employee.bank_name} />
          <InfoRow icon={FiDollarSign} label="N° Compte" value={employee.bank_account} />
          <InfoRow icon={FiDollarSign} label="RIB" value={employee.rib} />
        </div>
      </div>
    </div>
  );
}
