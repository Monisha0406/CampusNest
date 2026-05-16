import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { BedDouble, CreditCard, MessageSquareWarning } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ room: null, fees: [], complaints: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, complaintsRes] = await Promise.all([
          api.get(`/students/${user._id}`),
          api.get('/complaints?limit=3')
        ]);
        setData({
          room: studentRes.data.room,
          fees: studentRes.data.fees,
          complaints: complaintsRes.data.complaints
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const pendingFees = data.fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');
  const activeComplaints = data.complaints.filter(c => c.status !== 'Resolved');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>My Dashboard</h2>
          <p>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard title="My Room" value={data.room ? data.room.roomNumber : 'Not Assigned'} icon={BedDouble} color="primary" trend={data.room ? `Block ${data.room.block}` : ''} />
        <StatCard title="Pending Fees" value={`₹${pendingFees.reduce((acc, f) => acc + f.amount, 0)}`} icon={CreditCard} color="danger" trend={`${pendingFees.length} invoice(s)`} trendUp={false} />
        <StatCard title="Active Complaints" value={activeComplaints.length} icon={MessageSquareWarning} color="warning" trend="Check status" trendUp={false} />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Fee Invoices</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.fees.slice(0, 3).map(f => (
                  <tr key={f._id}>
                    <td>{f.month}</td>
                    <td>₹{f.amount}</td>
                    <td>
                      <span className={`badge badge-${f.status === 'Paid' ? 'success' : 'danger'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.fees.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center'}}>No fee records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Complaints</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.complaints.map(c => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>
                      <span className={`badge badge-${c.status === 'Resolved' ? 'success' : 'warning'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.complaints.length === 0 && <tr><td colSpan="2" style={{textAlign: 'center'}}>No complaints</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
