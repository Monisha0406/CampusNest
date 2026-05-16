import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import StudentsList from './pages/StudentsList';
import RoomsManager from './pages/RoomsManager';
import FeeManager from './pages/FeeManager';
import ComplaintsManager from './pages/ComplaintsManager';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Layout requiredRole="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="rooms" element={<RoomsManager />} />
            <Route path="fees" element={<FeeManager />} />
            <Route path="complaints" element={<ComplaintsManager />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<Layout requiredRole="student" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<div className="page-content">Profile coming soon</div>} />
            <Route path="room" element={<div className="page-content">Room details coming soon</div>} />
            <Route path="fees" element={<FeeManager />} />
            <Route path="complaints" element={<ComplaintsManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
