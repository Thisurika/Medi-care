import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Download, Search, User, Pill, Calendar, AlertCircle } from 'lucide-react';

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription? This will also remove the associated medicine reminders for the patient.')) {
      return;
    }
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Delete error', err);
      alert(err.response?.data?.message || 'Failed to delete prescription.');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF download error', err);
      alert('Failed to download prescription PDF.');
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const term = search.toLowerCase();
    const patientName = p.patient?.name?.toLowerCase() || '';
    const doctorName = p.doctor?.name?.toLowerCase() || '';
    const medNames = p.medicines?.map(m => m.name.toLowerCase()).join(' ') || '';
    return patientName.includes(term) || doctorName.includes(term) || medNames.includes(term);
  });

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-breadcrumb">Management</div>
          <h1 className="page-title">
            {user?.role === 'doctor' ? 'My Issued Prescriptions' : 'Prescriptions'}
          </h1>
        </div>
        {user?.role === 'doctor' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/prescriptions/new')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> New Prescription
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20, maxWidth: 400, position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by patient name or medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <Pill size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No prescriptions found</h3>
          <p style={{ fontSize: 13 }}>
            {search ? 'Try matching another search term.' : 'Click "New Prescription" to write your first prescription.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredPrescriptions.map((rx) => (
            <div key={rx._id} className="card" style={{ padding: 20 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    {user?.role === 'patient' ? `Dr. ${rx.doctor?.name || 'Unknown'}` : (rx.patient?.name || 'Unknown Patient')}
                  </h3>
                  {user?.role !== 'patient' && rx.patient?.email && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {rx.patient.email}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} />
                    Issued on {new Date(rx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownloadPDF(rx._id)}
                    title="Download PDF"
                  >
                    <Download size={14} /> PDF
                  </button>

                  {(user?.role === 'doctor' || user?.role === 'admin') && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/prescriptions/${rx._id}/edit`)}
                        title="Edit Prescription"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(rx._id)}
                        style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        title="Delete Prescription"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Medicines List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {rx.medicines.map((med, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {med.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>({med.dosage})</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Duration: {med.durationDays} day{med.durationDays !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {med.instructions && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Instruction: {med.instructions}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {med.timing?.morning && <span style={{ fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Morning</span>}
                      {med.timing?.afternoon && <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Afternoon</span>}
                      {med.timing?.night && <span style={{ fontSize: 10, background: 'rgba(139, 92, 246, 0.15)', color: 'var(--purple)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Night</span>}
                    </div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <strong>Notes:</strong> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
