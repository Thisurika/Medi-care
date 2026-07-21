import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Calendar, User, Clock, FileText } from 'lucide-react';

function StatusBadge({ status }) {
  const map = { pending:'badge-pending', approved:'badge-approved', completed:'badge-completed', cancelled:'badge-cancelled' };
  return <span className={`badge ${map[status]||'badge-completed'}`}>{status?.charAt(0).toUpperCase()+status?.slice(1)}</span>;
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(r => setAppt(r.data.appointment))
      .catch(() => setError('Appointment not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      const r = await api.get(`/appointments/${id}`);
      setAppt(r.data.appointment);
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Layout><div className="spinner-wrap"><div className="spinner" /></div></Layout>;
  if (error) return <Layout><div className="error-msg">{error}</div></Layout>;

  const doctorName = appt?.doctor?.user?.name || '—';
  const patientName = appt?.patient?.name || '—';

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Appointments</div>
          <h1 className="page-title">Appointment Details</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Appointment #{id.slice(-6)}</div>
            <StatusBadge status={appt?.status} />
          </div>

          {[
            { icon: User, label: 'Doctor', value: doctorName },
            { icon: User, label: 'Patient', value: patientName },
            { icon: Calendar, label: 'Date', value: new Date(appt?.appointment_date).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) },
            { icon: Clock, label: 'Time', value: appt?.appointment_time },
            { icon: FileText, label: 'Notes', value: appt?.notes || 'None' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, width:120, color:'var(--text-muted)', fontSize:13, fontWeight:500, flexShrink:0 }}>
                <Icon size={14} />{label}
              </div>
              <div style={{ fontSize:13.5, color:'var(--text-primary)' }}>{value}</div>
            </div>
          ))}

          {/* Actions */}
          {appt?.status !== 'cancelled' && appt?.status !== 'completed' && (
            <div style={{ display:'flex', gap:10, marginTop:20, flexWrap:'wrap' }}>
              {(user?.role === 'admin' || user?.role === 'doctor') && appt?.status === 'pending' && (
                <button className="btn btn-primary" onClick={() => handleStatus('approved')}>Approve</button>
              )}
              {(user?.role === 'admin' || user?.role === 'doctor') && appt?.status === 'approved' && (
                <button className="btn btn-primary" onClick={() => handleStatus('completed')}>Mark Completed</button>
              )}
              <button className="btn btn-danger" onClick={() => { handleStatus('cancelled'); }}>Cancel Appointment</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
