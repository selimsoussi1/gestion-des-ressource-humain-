import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiDollarSign, FiFileText, FiUserPlus, FiCalendar, FiBarChart2, FiSettings } from 'react-icons/fi';

const navItems = [
  { to: '/', icon: FiHome, label: 'Tableau de bord', end: true },
  { to: '/employees', icon: FiUsers, label: 'Employés' },
  { to: '/payroll', icon: FiDollarSign, label: 'Paie' },
  { to: '/contracts', icon: FiFileText, label: 'Contrats' },
  { to: '/recruitment', icon: FiUserPlus, label: 'Recrutement' },
  { to: '/absences', icon: FiCalendar, label: 'Absences' },
  { to: '/reports', icon: FiBarChart2, label: 'Rapports' },
  { to: '/payroll/parameters', icon: FiSettings, label: 'Paramètres Paie' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-primary-900 to-primary-800 text-white transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">GRH</h1>
            <p className="text-xs text-primary-300">Ressources Humaines</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <p className="text-xs text-primary-400 text-center">GRH Platform v1.0</p>
          <p className="text-xs text-primary-400 text-center">© 2026</p>
        </div>
      </aside>
    </>
  );
}
