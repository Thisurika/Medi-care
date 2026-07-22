import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Calendar, FileText, Users, Download } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    pending:   'badge-pending',
    approved:  'badge-approved',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-completed'}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

/* ─── Admin Dashboard ─── */
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, reports: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users?role=doctor&limit=1'),
      api.get('/users?role=patient&limit=1'),
      api.get('/appointments?limit=5'),
      api.get('/reports?limit=1'),
    ])
      .then(([d, p, a, r]) => {
        setStats({
          doctors: d.data.total ?? d.data.count ?? 0,
          patients: p.data.total ?? p.data.count ?? 0,
          appointments: a.data.total ?? a.data.count ?? 0,
          reports: r.data.total ?? r.data.count ?? 0,
        });
        setRecentAppts(a.data.appointments || a.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Admin overview</div>
          <h1 className="page-title">MediCare Plus Control Center</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/services')}>Add Service</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Doctors', value: stats.doctors, icon: Users },
          { label: 'Patients', value: stats.patients, icon: Users },
          { label: 'Appointments', value: stats.appointments, icon: Calendar },
          { label: 'Reports', value: stats.reports, icon: FileText },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Appointments</div>
          <span className="action-link view" onClick={() => navigate('/appointments')}>View all</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppts.length === 0 ? (
                <tr><td colSpan={4} className="empty-state">No appointments yet</td></tr>
              ) : recentAppts.slice(0, 5).map((a) => (
                <tr key={a._id}>
                  <td><strong>{a.patient?.name || '—'}</strong></td>
                  <td>{a.doctor?.user?.name || a.doctor?.name || '—'}</td>
                  <td>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ─── Patient Dashboard ─── */
function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, reports: 0 });
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments?limit=5'),
      api.get('/reports?limit=4'),
    ])
      .then(([a, r]) => {
        const appts = a.data.appointments || a.data.data || [];
        const rpts = r.data.reports || r.data.data || [];
        setAppointments(appts);
        setReports(rpts);
        setStats({
          upcoming: appts.filter(x => ['pending','approved'].includes(x.status)).length,
          completed: appts.filter(x => x.status === 'completed').length,
          reports: rpts.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Patient portal</div>
          <h1 className="page-title">Hello, {user?.name}</h1>
          <p className="page-sub">Manage your appointments, reports, and conversations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <Calendar size={15} />
          Book appointment
        </button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Upcoming visits</div><div className="stat-value">{loading ? '—' : stats.upcoming}</div></div>
        <div className="stat-card"><div className="stat-label">Completed visits</div><div className="stat-value">{loading ? '—' : stats.completed}</div></div>
        <div className="stat-card"><div className="stat-label">Reports</div><div className="stat-value">{loading ? '—' : stats.reports}</div></div>
      </div>

      <div className="two-col-grid">
        {/* Upcoming Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming appointments</div>
            <span className="action-link view" onClick={() => navigate('/appointments')}>View all</span>
          </div>
          {appointments.filter(a => ['pending','approved'].includes(a.status)).length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No upcoming appointments</div>
          ) : appointments.filter(a => ['pending','approved'].includes(a.status)).slice(0,4).map(a => (
            <div key={a._id} className="card card-hover" style={{ padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>
                    {a.doctor?.user?.name || a.doctor?.name || 'Doctor'}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                    {new Date(a.appointment_date).toLocaleDateString('en-US',{month:'short',day:'2-digit'})} at {a.appointment_time}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent reports</div>
            <span className="action-link view" onClick={() => navigate('/reports')}>All reports</span>
          </div>
          {reports.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No reports yet</div>
          ) : reports.slice(0,4).map(r => (
            <div key={r._id} className="card card-hover" style={{ padding: '12px 16px', marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-primary)' }}>{r.report_type}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Doctor: {r.doctor?.name || '—'}</div>
                </div>
                {r.file_path && (
                  <a href={`http://localhost:5000${r.file_path}`} target="_blank" rel="noopener noreferrer" className="action-link view" style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <Download size={13} /> Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Doctor Dashboard ─── */
function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments?limit=5')
      .then(res => setAppointments(res.data.appointments || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['pending','approved'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Doctor portal</div>
          <h1 className="page-title">Hello, {user?.name}</h1>
          <p className="page-sub">Manage your schedule, patients, and reports.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Upcoming</div><div className="stat-value">{loading ? '—' : upcoming.length}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{loading ? '—' : completed.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Appts</div><div className="stat-value">{loading ? '—' : appointments.length}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Today's schedule</div>
          <span className="action-link view" onClick={() => navigate('/appointments')}>View all</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Patient</th><th>Date & Time</th><th>Status</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {appointments.length === 0
                ? <tr><td colSpan={4} className="empty-state">No appointments</td></tr>
                : appointments.slice(0,5).map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.patient?.name || '—'}</strong></td>
                    <td>{new Date(a.appointment_date).toLocaleDateString('en-US',{month:'short',day:'2-digit'})} {a.appointment_time}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.notes || '—'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <Layout>
      {user?.role === 'admin'   && <AdminDashboard />}
      {user?.role === 'doctor'  && <DoctorDashboard />}
      {user?.role === 'patient' && <PatientDashboard />}
    </Layout>
  );
}
