import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Clock, DollarSign, AlertCircle } from 'lucide-react';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ doctor_id: '', patient_id: '', appointment_date: '', appointment_time: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dynamic slot state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [consultationFee, setConsultationFee] = useState(null);

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.doctors || r.data.data || [])).catch(() => {});
    if (user?.role === 'admin') {
      api.get('/users?role=patient').then(r => setPatients(r.data.users || r.data.data || [])).catch(() => {});
    }
  }, [user]);

  // Fetch available slots when doctor + date both selected
  useEffect(() => {
    if (form.doctor_id && form.appointment_date) {
      setSlotsLoading(true);
      setSlotsMessage('');
      setAvailableSlots([]);
      setForm(p => ({ ...p, appointment_time: '' }));

      api.get(`/doctors/${form.doctor_id}/available-slots?date=${form.appointment_date}`)
        .then(res => {
          if (!res.data.available) {
            setSlotsMessage(res.data.reason || 'Doctor is not available on this date.');
            setAvailableSlots([]);
          } else {
            setAvailableSlots(res.data.slots || []);
            setConsultationFee(res.data.consultation_fee);
            if (res.data.slots.length === 0) {
              setSlotsMessage('All time slots are booked for this date. Please try another date.');
            }
          }
        })
        .catch(() => setSlotsMessage('Failed to fetch available slots.'))
        .finally(() => setSlotsLoading(false));
    } else {
      setAvailableSlots([]);
      setSlotsMessage('');
    }
  }, [form.doctor_id, form.appointment_date]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const selectTimeSlot = (slot) => {
    setForm(p => ({ ...p, appointment_time: slot }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.appointment_time) {
      setError('Please select a time slot.');
      return;
    }
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

  // Get selected doctor info for display
  const selectedDoctor = doctors.find(d => d._id === form.doctor_id);

  return (
    <Layout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
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
            {/* Doctor Select */}
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange} className="form-control" required>
                <option value="">Select a doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name || d.name} — {d.specialization} {d.hospital ? `(${d.hospital})` : ''} — Rs. {d.consultation_fee}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Info Card */}
            {selectedDoctor && (
              <div style={{
                background: 'var(--bg-light)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                display: 'flex',
                gap: 16,
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <strong>Dr. {selectedDoctor.user?.name || selectedDoctor.name}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
                    {selectedDoctor.specialization} • {selectedDoctor.experience_years || 0} yrs exp
                    {selectedDoctor.hospital && ` • ${selectedDoctor.hospital}`}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 700,
                  color: 'var(--primary)',
                  fontSize: '1.1rem'
                }}>
                  <DollarSign size={18} /> Rs. {selectedDoctor.consultation_fee}
                </div>
              </div>
            )}

            {user?.role === 'admin' && (
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select name="patient_id" value={form.patient_id} onChange={handleChange} className="form-control">
                  <option value="">Select patient (optional)</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {/* Date */}
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

            {/* Dynamic Time Slots */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Available Time Slots
              </label>

              {!form.doctor_id || !form.appointment_date ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Select a doctor and date to see available slots.
                </p>
              ) : slotsLoading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading available slots...</p>
              ) : slotsMessage ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '0.9rem', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                  <AlertCircle size={16} /> {slotsMessage}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => selectTimeSlot(slot)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: '2px solid',
                        borderColor: form.appointment_time === slot ? 'var(--primary)' : 'var(--border)',
                        background: form.appointment_time === slot ? 'var(--primary)' : 'transparent',
                        color: form.appointment_time === slot ? '#fff' : 'var(--text-dark)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="form-control" placeholder="Reason for visit or any notes..." />
            </div>

            {/* Fee display */}
            {consultationFee && form.appointment_time && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>Rs. {consultationFee}</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading || !form.appointment_time}>
              {loading ? 'Booking…' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
