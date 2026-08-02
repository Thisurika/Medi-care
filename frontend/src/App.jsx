import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing          from './pages/Landing';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Appointments     from './pages/Appointments';
import BookAppointment  from './pages/BookAppointment';
import AppointmentDetail from './pages/AppointmentDetail';
import Reports          from './pages/Reports';
import Messages         from './pages/Messages';
import Feedback         from './pages/Feedback';
import Doctors          from './pages/Doctors';
import Services         from './pages/Services';
import CreatePrescription from './pages/Doctor/CreatePrescription';
import ScheduleManagement from './pages/Doctor/ScheduleManagement';
import MedicineReminders  from './pages/Patient/MedicineReminders';
import DoctorPrescriptions from './pages/DoctorPrescriptions';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — all logged-in users */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/appointments/new" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          
          {/* Patient only */}
          <Route path="/medicines" element={<ProtectedRoute roles={['patient']}><MedicineReminders /></ProtectedRoute>} />

          {/* Prescriptions — shared */}
          <Route path="/prescriptions" element={<ProtectedRoute roles={['doctor', 'patient', 'admin']}><DoctorPrescriptions /></ProtectedRoute>} />

          {/* Doctor only */}
          <Route path="/prescriptions/new" element={<ProtectedRoute roles={['doctor']}><CreatePrescription /></ProtectedRoute>} />
          <Route path="/prescriptions/:id/edit" element={<ProtectedRoute roles={['doctor', 'admin']}><CreatePrescription /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute roles={['doctor']}><ScheduleManagement /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/doctors"  element={<ProtectedRoute roles={['admin']}><Doctors /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute roles={['admin']}><Services /></ProtectedRoute>} />
          <Route path="/services/new" element={<ProtectedRoute roles={['admin']}><Services /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

