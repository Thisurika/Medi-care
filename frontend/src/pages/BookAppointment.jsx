import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ doctor_id: '', patient_id: '', appointment_date: '', appointment_time: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.doctors || r.data.data || [])).catch(() => {});
    if (user?.role === 'admin') {
      api.get('/users?role=patient').then(r => setPatients(r.data.users || r.data.data || [])).catch(() => {});
    }
  }, [user]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { doctor_id: form.doctor_id, appointment_date: form.appointment_date, appointment_time: form.appointment_time, notes: form.notes };
      if (user?.role === 'admin' && form.patient_id) payload.patient_id = form.patient_id;
      await api.post('/appointments', payload);
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="page-header-row" style={{ marginBottom: 28 }}>
          <div>
            <div className="page-breadcrumb">Appointments</div>
            <h1 className="page-title">Book Appointment</h1>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange} className="form-control" required>
                <option value="">Select a doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name || d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            {user?.role === 'admin' && (
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select name="patient_id" value={form.patient_id} onChange={handleChange} className="form-control">
                  <option value="">Select patient (optional)</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={form.appointment_date}
                  onChange={handleChange}
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <select name="appointment_time" value={form.appointment_time} onChange={handleChange} className="form-control" required>
                  <option value="">Select time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="form-control" placeholder="Reason for visit or any notes..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
              {loading ? 'Booking…' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
