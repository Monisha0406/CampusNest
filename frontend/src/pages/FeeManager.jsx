import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function FeeManager() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchFees = async () => {
    try {
      const res = await api.get('/fees');
      setFees(res.data.fees);
    } catch (err) {
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  const handlePay = async (id) => {
    if (!isAdmin) return toast.error('Only admins can record payments manually in demo');
    try {
      const amount = prompt('Enter payment amount:');
      if (!amount) return;
      await api.post(`/fees/${id}/pay`, { amount, method: 'Cash', remarks: 'Manual entry' });
      toast.success('Payment recorded');
      fetchFees();
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Fee Records</h3>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Month</th>
                <th>Total Amt</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id}>
                  {isAdmin && <td>{f.student?.name}</td>}
                  <td>{f.month}</td>
                  <td>₹{f.amount}</td>
                  <td style={{ color: 'var(--success)' }}>₹{f.paidAmount}</td>
                  <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${f.status === 'Paid' ? 'success' : f.status === 'Pending' ? 'warning' : f.status === 'Partial' ? 'info' : 'danger'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    {f.status !== 'Paid' && isAdmin && (
                      <button className="btn btn-sm btn-primary" onClick={() => handlePay(f._id)}>Record Pay</button>
                    )}
                    {f.status !== 'Paid' && !isAdmin && (
                      <button className="btn btn-sm btn-primary">Pay Now</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
