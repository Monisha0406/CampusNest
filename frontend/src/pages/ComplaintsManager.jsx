import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ComplaintsManager() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints);
    } catch (err) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleResolve = async (id) => {
    if (!isAdmin) return;
    try {
      const remarks = prompt('Enter resolution remarks:');
      await api.put(`/complaints/${id}`, { status: 'Resolved', adminRemarks: remarks });
      toast.success('Complaint resolved');
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to resolve complaint');
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">{isAdmin ? 'Manage Complaints' : 'My Complaints'}</h3>
        {!isAdmin && <button className="btn btn-primary">Raise Complaint</button>}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Title & Desc</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  {isAdmin && <td>{c.student?.name}</td>}
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description.substring(0, 50)}...</div>
                  </td>
                  <td>{c.category}</td>
                  <td>
                    <span style={{ color: c.priority === 'High' ? 'var(--danger)' : c.priority === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${c.status === 'Resolved' ? 'success' : c.status === 'Pending' ? 'warning' : 'info'}`}>
                      {c.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {c.status !== 'Resolved' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleResolve(c._id)}>Resolve</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
