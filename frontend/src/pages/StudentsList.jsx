import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/students?search=${search}`);
      setStudents(res.data.students);
    } catch (err) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchStudents, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleAddStudent = async () => {
    const name = window.prompt('Enter student name:');
    if (!name) return;
    const email = window.prompt('Enter student email:');
    if (!email) return;

    try {
      await api.post('/students', {
        name,
        email,
        phone: '1234567890',
        gender: 'Other',
        course: 'B.Tech',
        admissionYear: new Date().getFullYear(),
        address: 'N/A'
      });
      toast.success('Student added successfully!');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Manage Students</h3>
        <button className="btn btn-primary" onClick={handleAddStudent}><Plus size={16} /> Add Student</button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {s._id.slice(-6)}</div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.course}</td>
                  <td>{s.phone || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-icon btn-secondary" title="Edit"><Edit size={14} /></button>
                      <button className="btn btn-icon btn-danger" title="Delete" onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
