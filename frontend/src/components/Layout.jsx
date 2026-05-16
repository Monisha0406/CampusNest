import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Layout({ requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/complaints/stats').then(res => {
        setPendingComplaints(res.data.stats.pending || 0);
      }).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar pendingComplaints={pendingComplaints} />
      <main className="main-content">
        <Navbar />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
