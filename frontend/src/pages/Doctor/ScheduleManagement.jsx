import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Save, Calendar, Clock, Ban, DollarSign, Building2, ArrowLeft } from 'lucide-react';

const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DEFAULT_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM',
];

export default function ScheduleManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [consultationFee, setConsultationFee] = useState(100);
  const [hospital, setHospital] = useState('');

  useEffect(() => {
    api.get('/doctors/me/schedule')
      .then((res) => {
        const s = res.data.schedule;
        setAvailabilityDays(s.availability_days || []);
        setTimeSlots(s.time_slots || []);
        setUnavailableDates((s.unavailable_dates || []).map((d) => d.split('T')[0]));
        setConsultationFee(s.consultation_fee || 100);
        setHospital(s.hospital || '');
      })
      .catch((err) => setError('Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setAvailabilityDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot) => {
    setTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !unavailableDates.includes(newBlockedDate)) {
      setUnavailableDates([...unavailableDates, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date) => {
    setUnavailableDates(unavailableDates.filter((d) => d !== date));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/doctors/me/schedule', {
        availability_days: availabilityDays,
        time_slots: timeSlots,
        unavailable_dates: unavailableDates,
        consultation_fee: Number(consultationFee),
        hospital,
      });
      setSuccess('Schedule updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div style={{ padding: 40, textAlign: 'center' }}>Loading schedule...</div></Layout>;
  }

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header-row" style={{ marginBottom: 28 }}>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="page-title">Schedule Management</h1>
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        {/* ── Available Days ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calendar size={20} /> Available Days
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: availabilityDays.includes(day) ? 'var(--primary)' : 'var(--border)',
                  background: availabilityDays.includes(day) ? 'var(--primary)' : 'transparent',
                  color: availabilityDays.includes(day) ? '#fff' : 'var(--text-dark)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* ── Time Slots ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={20} /> Time Slots
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12 }}>
            Click to toggle available appointment times.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DEFAULT_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: timeSlots.includes(slot) ? 'var(--primary)' : 'var(--border)',
                  background: timeSlots.includes(slot) ? 'var(--primary)' : 'transparent',
                  color: timeSlots.includes(slot) ? '#fff' : 'var(--text-gray)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* ── Unavailable / Blocked Dates ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Ban size={20} /> Block Dates (Holidays / Leave)
          </h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary" onClick={addBlockedDate} style={{ padding: '8px 16px' }}>
              Block Date
            </button>
          </div>
          {unavailableDates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No blocked dates.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {unavailableDates.sort().map((date) => (
                <span
                  key={date}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <button type="button" onClick={() => removeBlockedDate(date)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Fee & Hospital ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <DollarSign size={20} /> Consultation Fee
              </h3>
              <input
                type="number"
                min="0"
                className="form-control"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Building2 size={20} /> Hospital
              </h3>
              <input
                type="text"
                className="form-control"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. National Hospital Colombo"
              />
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1rem' }}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </Layout>
  );
}
