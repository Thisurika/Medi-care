import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Upload, Download, FileText } from 'lucide-react';

function ReportsList({ reports, loading, onRefresh, user }) {
  const handleDownload = (filePath) => {
    window.open(`http://localhost:5000${filePath}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      onRefresh();
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Report Type</th>
              {user?.role !== 'patient' && <th>Patient</th>}
              <th>Doctor</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">📄</div>No reports found</div></td></tr>
            ) : reports.map(r => (
              <tr key={r._id}>
                <td><strong>{r.report_type}</strong></td>
                {user?.role !== 'patient' && <td>{r.patient?.name || '—'}</td>}
                <td>{r.doctor?.name || '—'}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '—'}</td>
                <td>
                  <div className="actions-cell">
                    {r.file_path && (
                      <span className="action-link view" onClick={() => handleDownload(r.file_path)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Download size={13} /> Download
                      </span>
                    )}
                    {(user?.role === 'admin' || user?.role === 'doctor') && (
                      <span className="action-link delete" onClick={() => handleDelete(r._id)}>Delete</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewReportForm({ doctors, patients, onSuccess, onCancel }) {
  const [form, setForm] = useState({ doctor_id: '', patient_id: '', report_type: '', description: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('doctor_id', form.doctor_id);
      fd.append('patient_id', form.patient_id);
      fd.append('report_type', form.report_type);
      fd.append('description', form.description);
      if (file) fd.append('report_file', file);
      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="card">
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Upload</div>
            <div className="section-title" style={{ fontSize: 20 }}>New medical report</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Back</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor</label>
            <select name="doctor_id" value={form.doctor_id} onChange={handleChange} className="form-control" required>
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Patient</label>
            <select name="patient_id" value={form.patient_id} onChange={handleChange} className="form-control" required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Report type</label>
              <input type="text" name="report_type" value={form.report_type} onChange={handleChange} className="form-control" placeholder="e.g. Blood Test, X-Ray" required />
            </div>
            <div className="form-group">
              <label className="form-label">File (PDF/Image)</label>
              <label className="form-file-label" style={{ width: '100%' }}>
                <Upload size={14} />
                {file ? file.name : 'Choose file'}
                <input type="file" className="form-file-input" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Brief notes about this report..." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports');
      setReports(data.reports || data.data || []);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchReports();
    if (user?.role !== 'patient') {
      api.get('/doctors').then(r => setDoctors(r.data.doctors || r.data.data || [])).catch(() => {});
      api.get('/users?role=patient').then(r => setPatients(r.data.users || r.data.data || [])).catch(() => {});
    }
  }, [user]);

  if (showForm) {
    return (
      <Layout>
        <NewReportForm
          doctors={doctors}
          patients={patients}
          onSuccess={() => { setShowForm(false); fetchReports(); }}
          onCancel={() => setShowForm(false)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Reports</div>
          <h1 className="page-title">Medical Reports</h1>
        </div>
        {(user?.role === 'admin' || user?.role === 'doctor') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Upload size={15} /> Upload Report
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}
      <ReportsList reports={reports} loading={loading} onRefresh={fetchReports} user={user} />
    </Layout>
  );
}
