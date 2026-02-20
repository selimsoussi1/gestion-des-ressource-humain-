import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './components/Auth/LoginPage';
import DashboardHome from './components/Dashboard/DashboardHome';
import EmployeeList from './components/Employees/EmployeeList';
import EmployeeForm from './components/Employees/EmployeeForm';
import EmployeeDetail from './components/Employees/EmployeeDetail';
import PayrollList from './components/Payroll/PayrollList';
import PayrollCalculation from './components/Payroll/PayrollCalculation';
import PayrollParams from './components/Payroll/PayrollParams';
import ContractList from './components/Contracts/ContractList';
import ContractForm from './components/Contracts/ContractForm';
import RecruitmentList from './components/Recruitment/RecruitmentList';
import RecruitmentForm from './components/Recruitment/RecruitmentForm';
import AbsenceList from './components/Absences/AbsenceList';
import AbsenceForm from './components/Absences/AbsenceForm';
import ReportsPage from './components/Reports/ReportsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            <Route path="payroll" element={<PayrollList />} />
            <Route path="payroll/calculate" element={<PayrollCalculation />} />
            <Route path="payroll/parameters" element={<PayrollParams />} />
            <Route path="contracts" element={<ContractList />} />
            <Route path="contracts/new" element={<ContractForm />} />
            <Route path="absences" element={<AbsenceList />} />
            <Route path="absences/new" element={<AbsenceForm />} />
            <Route path="recruitment" element={<RecruitmentList />} />
            <Route path="recruitment/new" element={<RecruitmentForm />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
