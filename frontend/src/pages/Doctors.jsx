import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Search, Star, Clock, DollarSign } from 'lucide-react';

const AVATAR_COLORS = ['#2563eb','#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444'];
const getColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = n => (n||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

function DoctorCard({ doctor }) {
  const name = doctor.user?.name || '—';
  const spec = doctor.specialization;

  return (
    <div className="doctor-card">
      <div className="doctor-card-avatar" style={{ background: getColor(name), color: 'white' }}>
        {getInitials(name)}
      </div>
      <div className="doctor-card-name">{name}</div>
      <div className="doctor-card-spec">{spec}</div>

      <div className="doctor-card-meta">
        <Clock size={12} /> {doctor.experience_years} yrs experience
      </div>
      <div className="doctor-card-meta">
        <Star size={12} style={{ color: 'var(--amber)' }} fill="var(--amber)" />
        {doctor.rating_avg?.toFixed(1) || '—'} ({doctor.rating_count || 0} reviews)
      </div>

      {doctor.availability_days?.length > 0 && (
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:10 }}>
          {doctor.availability_days.map(d => (
            <span key={d} style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'var(--bg-input)', color:'var(--text-muted)', fontWeight:600 }}>{d}</span>
          ))}
        </div>
      )}

      <div className="doctor-card-fee">
        ${doctor.consultation_fee} <span>/ consultation</span>
      </div>
    </div>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctors')
      .then(r => { const d = r.data.doctors || r.data.data || []; setDoctors(d); setFiltered(d); })
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      d.user?.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Admin</div>
          <h1 className="page-title">Doctors</h1>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth: 340, marginBottom: 24 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: 36 }}
          placeholder="Search by name or specialization…"
        />
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">🩺</div>No doctors found</div>
      ) : (
        <div className="doctor-grid">
          {filtered.map(d => <DoctorCard key={d._id} doctor={d} />)}
        </div>
      )}
    </Layout>
  );
}
