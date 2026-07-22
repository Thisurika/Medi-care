import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ICONS = { Radiology:'🔬', Dermatology:'✨', Orthopedics:'🦴', Pediatrics:'👶', Neurology:'🧠', Cardiology:'❤️', default:'🏥' };
const getIcon = cat => ICONS[cat] || ICONS.default;

const CATEGORY_COLORS = {
  Radiology: '#8b5cf6', Dermatology: '#06b6d4', Orthopedics: '#f59e0b',
  Pediatrics: '#10b981', Neurology: '#3b82f6', Cardiology: '#ef4444'
};
const getCatColor = cat => CATEGORY_COLORS[cat] || '#2563eb';

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(service || { category:'', name:'', description:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (service?._id) {
        await api.put(`/services/${service._id}`, form);
      } else {
        await api.post('/services', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{service?._id ? 'Edit Service' : 'Add New Service'}</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input type="text" name="category" value={form.category} onChange={handleChange} className="form-control" placeholder="e.g. Radiology" required />
          </div>
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="e.g. MRI Scan" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Brief description…" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : service?._id ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | service object | 'new'
  const [error, setError] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/services');
      setServices(data.services || data.data || []);
    } catch { setError('Failed to load services.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await api.delete(`/services/${id}`); fetchServices(); }
    catch { alert('Delete failed.'); }
  };

  // Group by category
  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <Layout>
      {modal && (
        <ServiceModal
          service={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchServices(); }}
        />
      )}

      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Admin</div>
          <h1 className="page-title">Healthcare Services</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">🏥</div>No services yet. Add your first!</div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${getCatColor(cat)}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                {getIcon(cat)}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{cat}</div>
              <span className="badge badge-blue">{items.length}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
              {items.map(s => (
                <div key={s._id} className="card card-hover" style={{ padding:'18px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14.5, color:'var(--text-primary)', marginBottom:6 }}>{s.name}</div>
                      <div style={{ fontSize:12.5, color:'var(--text-muted)', lineHeight:1.6 }}>{s.description}</div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:12 }}>
                      <button className="btn-icon" style={{ padding:'5px' }} onClick={() => setModal(s)} title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button className="btn-icon" style={{ padding:'5px', color:'var(--red)' }} onClick={() => handleDelete(s._id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}
