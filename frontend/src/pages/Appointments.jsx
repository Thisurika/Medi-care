import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatusBadge({ status }) {
  const map = { pending:'badge-pending', approved:'badge-approved', completed:'badge-completed', cancelled:'badge-cancelled' };
  return <span className={`badge ${map[status] || 'badge-completed'}`}>{status?.charAt(0).toUpperCase()+status?.slice(1)}</span>;
}

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments || []);
    } catch (e) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Appointments</div>
          <h1 className="page-title">Your schedule</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          Book appointment
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state">No appointments found</div></td></tr>
                ) : appointments.map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.doctor?.user?.name || '—'}</strong></td>
                    <td>{a.patient?.name || '—'}</td>
                    <td>
                      {new Date(a.appointment_date).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})}
                      {' '}{a.appointment_time}
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div className="actions-cell">
                        <span className="action-link view" onClick={() => navigate(`/appointments/${a._id}`)}>View</span>
                        {(user?.role === 'admin' || user?.role === 'doctor') && a.status === 'pending' && (
                          <span className="action-link edit" onClick={() => handleStatusUpdate(a._id, 'approved')}>Approve</span>
                        )}
                        {(user?.role === 'admin' || user?.role === 'doctor') && a.status === 'approved' && (
                          <span className="action-link edit" onClick={() => handleStatusUpdate(a._id, 'completed')}>Complete</span>
                        )}
                        <span className="action-link cancel" onClick={() => handleCancel(a._id)}>Cancel</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
