import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomsManager() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch (err) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    const roomNumber = window.prompt('Enter room number:');
    if (!roomNumber) return;
    const capacity = window.prompt('Enter room capacity (1-10):', '2');
    if (!capacity) return;
    const monthlyRent = window.prompt('Enter monthly rent:', '5000');
    if (!monthlyRent) return;

    try {
      await api.post('/rooms', {
        roomNumber,
        capacity: Number(capacity),
        monthlyRent: Number(monthlyRent),
        type: 'Double',
        floor: 1,
        block: 'A'
      });
      toast.success('Room added successfully!');
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Manage Rooms</h3>
        <button className="btn btn-primary" onClick={handleAddRoom}><Plus size={16} /> Add Room</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room No</th>
                <th>Type</th>
                <th>Block/Floor</th>
                <th>Rent</th>
                <th>Occupancy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.roomNumber}</td>
                  <td>{r.type}</td>
                  <td>Block {r.block} / Fl {r.floor}</td>
                  <td>₹{r.monthlyRent}</td>
                  <td>
                    {r.occupants?.length} / {r.capacity}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status === 'Available' ? 'success' : r.status === 'Full' ? 'danger' : 'warning'}`}>
                      {r.status}
                    </span>
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
