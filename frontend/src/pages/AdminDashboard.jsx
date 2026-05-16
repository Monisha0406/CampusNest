import { useState, useEffect } from 'react';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import { Users, BedDouble, CreditCard, MessageSquareWarning } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading || !data) return <div className="loading"><div className="spinner"></div></div>;

  const { stats, recentStudents, recentComplaints, monthlyCollection, courseDistribution, complaintCategories } = data;

  const collectionChart = {
    labels: monthlyCollection.map(m => m._id),
    datasets: [{
      label: 'Fee Collection (₹)',
      data: monthlyCollection.map(m => m.total),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6,
    }]
  };

  const roomChart = {
    labels: ['Available', 'Occupied'],
    datasets: [{
      data: [stats.availableRooms, stats.occupiedRooms],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const courseChart = {
    labels: courseDistribution.map(c => c._id),
    datasets: [{
      data: courseDistribution.map(c => c.count),
      backgroundColor: colors,
      borderWidth: 0,
    }]
  };

  const categoryChart = {
    labels: complaintCategories.map(c => c._id),
    datasets: [{
      label: 'Complaints',
      data: complaintCategories.map(c => c.count),
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderRadius: 4,
    }]
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Admin Dashboard</h2>
          <p>Overview of hostel metrics and activities</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="primary" trend="Active" />
        <StatCard title="Available Rooms" value={stats.availableRooms} icon={BedDouble} color="success" trend={`${stats.occupiedRooms} occupied`} trendUp={false} />
        <StatCard title="Total Collection" value={`₹${stats.paidFees * 4000 || '0'}`} icon={CreditCard} color="info" trend={`${stats.collectionRate}% Rate`} />
        <StatCard title="Pending Complaints" value={stats.pendingComplaints} icon={MessageSquareWarning} color="warning" trend="Action needed" trendUp={false} />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Collection (Last 6 Months)</h3>
          </div>
          <div className="chart-container">
            <Bar data={collectionChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Room Occupancy Status</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '220px' }}>
              <Doughnut data={roomChart} options={{ responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0c0' } } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Course Distribution</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '220px' }}>
              <Doughnut data={courseChart} options={{ responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { position: 'right', labels: { color: '#a0a0c0', boxWidth: 12 } } } }} />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Complaints by Category</h3>
          </div>
          <div className="chart-container">
            <Bar data={categoryChart} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Students</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map(s => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.course}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Complaints</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c._id}>
                    <td>{c.student?.name}</td>
                    <td>{c.title}</td>
                    <td><span className="badge badge-warning">Pending</span></td>
                  </tr>
                ))}
                {recentComplaints.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign: 'center'}}>No pending complaints</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
