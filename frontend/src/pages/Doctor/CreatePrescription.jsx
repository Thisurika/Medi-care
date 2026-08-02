import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Plus, Trash2, CheckCircle, ArrowLeft, Save, Edit2, Download, User, Calendar, Pill } from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const blankMedicine = () => ({
  name: '',
  dosage: '',
  instructions: '',
  durationDays: 1,
  startDate: getLocalDateString(),
  endDate: getLocalDateString(),
  timing: { morning: false, afternoon: false, night: false },
});

export default function CreatePrescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editId } = useParams(); // present when route is /prescriptions/:id/edit
  const isEditMode = Boolean(editId);

  const searchParams = new URLSearchParams(location.search);
  const initialPatientId = searchParams.get('patientId') || '';
  const initialApptId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [appointmentId, setAppointmentId] = useState(initialApptId);
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([blankMedicine()]);
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [issuedPrescriptions, setIssuedPrescriptions] = useState([]);
  const [rxLoading, setRxLoading] = useState(false);

  const fetchIssuedPrescriptions = async () => {
    setRxLoading(true);
    try {
      const { data } = await api.get('/prescriptions');
      setIssuedPrescriptions(data || []);
    } catch (e) {
      console.error('Failed to load prescriptions', e);
    } finally {
      setRxLoading(false);
    }
  };

  // Load patient list + existing prescription (if editing)
  useEffect(() => {
    const fetchPatients = api.get('/users?role=patient')
      .then(res => setPatients(res.data.users || res.data.data || res.data))
      .catch(err => console.error('Failed to load patients', err));

    fetchIssuedPrescriptions();

    if (isEditMode) {
      setPrefilling(true);
      api.get(`/prescriptions/${editId}`)
        .then(res => {
          const rx = res.data;
          setPatientId(rx.patient?._id || rx.patient || '');
          setNotes(rx.notes || '');
          // Normalize medicines from DB — ensure timing object exists
          setMedicines(rx.medicines.map(m => ({
            name: m.name || '',
            dosage: m.dosage || '',
            instructions: m.instructions || '',
            durationDays: m.durationDays || 1,
            startDate: m.startDate ? getLocalDateString(new Date(m.startDate)) : getLocalDateString(),
            endDate: m.endDate ? getLocalDateString(new Date(m.endDate)) : getLocalDateString(),
            timing: {
              morning: Boolean(m.timing?.morning),
              afternoon: Boolean(m.timing?.afternoon),
              night: Boolean(m.timing?.night),
            },
          })));
        })
        .catch(() => setError('Failed to load prescription for editing.'))
        .finally(() => setPrefilling(false));
    }
  }, [editId, isEditMode]);

  const handleAddMedicine = () => {
    setMedicines(prev => [...prev, blankMedicine()]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updated = prev.map((m, i) => i === index ? { ...m } : m);
      if (field.includes('timing.')) {
        const timingField = field.split('.')[1];
        updated[index].timing = { ...updated[index].timing, [timingField]: value };
      } else {
        updated[index][field] = value;
        // Auto-calculate end date based on duration / start date change
        if (field === 'durationDays' || field === 'startDate') {
          const startParts = (updated[index].startDate || getLocalDateString()).split('-').map(Number);
          const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
          const duration = parseInt(updated[index].durationDays, 10) || 1;
          start.setDate(start.getDate() + (duration - 1));
          updated[index].endDate = getLocalDateString(start);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (medicines.some(m => !m.name || !m.dosage || (!m.timing.morning && !m.timing.afternoon && !m.timing.night))) {
      setError('Please fill in all medicine details and select at least one timing for each.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isEditMode) {
        await api.put(`/prescriptions/${editId}`, { patientId, medicines, notes });
        navigate('/prescriptions/new');
      } else {
        await api.post('/prescriptions', {
          patientId,
          appointmentId: appointmentId || undefined,
          medicines,
          notes,
        });
        // Reset form
        setPatientId('');
        setNotes('');
        setMedicines([blankMedicine()]);
        // Refresh list
        await fetchIssuedPrescriptions();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} prescription`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 20 }}>
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(isEditMode ? '/prescriptions' : -1)}
            style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="page-breadcrumb">Prescriptions</div>
          <h1 className="page-title">{isEditMode ? 'Edit Prescription' : 'Create Prescription'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

        {prefilling ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Patient selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="form-label">Select Patient</label>
              <select
                className="form-control"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                disabled={isEditMode} // can't change patient when editing
              >
                <option value="">-- Select Patient --</option>
                {Array.isArray(patients) && patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                ))}
              </select>
              {isEditMode && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Patient cannot be changed when editing a prescription.
                </span>
              )}
            </div>

            {/* Medicines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0 }}>Medicines</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddMedicine}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              {medicines.map((med, index) => (
                <div
                  key={index}
                  style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 'var(--radius)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.02)' }}
                >
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}
                      title="Remove medicine"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Medicine Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        placeholder="e.g. Paracetamol"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Dosage</label>
                      <input
                        type="text"
                        className="form-control"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg, 1 Tablet"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      placeholder="e.g. After food"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={med.startDate}
                        onChange={(e) => handleMedicineChange(index, 'startDate', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={med.durationDays}
                        onChange={(e) => handleMedicineChange(index, 'durationDays', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Timing</label>
                    <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                      {['morning', 'afternoon', 'night'].map(t => (
                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                          <input
                            type="checkbox"
                            checked={med.timing[t]}
                            onChange={(e) => handleMedicineChange(index, `timing.${t}`, e.target.checked)}
                          />
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="form-label">Consultation Notes (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write any additional notes for the patient here..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
            >
              {loading ? (isEditMode ? 'Updating…' : 'Creating…') : isEditMode ? <><Save size={18} /> Update Prescription</> : <><CheckCircle size={18} /> Save Prescription</>}
            </button>
          </form>
        )}
      </div>

      {/* ── Issued Prescriptions History ── */}
      {!isEditMode && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={18} style={{ color: 'var(--primary)' }} />
              Issued Prescriptions ({issuedPrescriptions.length})
            </h2>
          </div>

          {rxLoading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : issuedPrescriptions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
              No prescriptions issued yet. Use the form above to create one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {issuedPrescriptions.map(rx => (
                <div key={rx._id} className="card" style={{ padding: 18 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                        <User size={15} style={{ color: 'var(--primary)' }} />
                        {rx.patient?.name || 'Unknown Patient'}
                      </div>
                      {rx.patient?.email && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rx.patient.email}</div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={11} />
                        {new Date(rx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          try {
                            const res = await api.get(`/prescriptions/${rx._id}/pdf`, { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `prescription-${rx._id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          } catch { alert('PDF download failed.'); }
                        }}
                        title="Download PDF"
                      >
                        <Download size={13} /> PDF
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/prescriptions/${rx._id}/edit`)}
                        title="Edit Prescription"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        title="Delete Prescription"
                        onClick={async () => {
                          if (!window.confirm('Delete this prescription? This will also remove the patient\'s medicine reminders for it.')) return;
                          try {
                            await api.delete(`/prescriptions/${rx._id}`);
                            setIssuedPrescriptions(prev => prev.filter(p => p._id !== rx._id));
                          } catch { alert('Delete failed.'); }
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rx.medicines.map((med, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 160px' }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{med.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{med.dosage}</span>
                        </div>
                        {med.instructions && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', flex: '1 1 140px' }}>{med.instructions}</div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.durationDays}d</div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {med.timing?.morning && <span style={{ fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>AM</span>}
                          {med.timing?.afternoon && <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.15)', color: 'var(--amber)', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>PM</span>}
                          {med.timing?.night && <span style={{ fontSize: 10, background: 'rgba(139,92,246,0.15)', color: 'var(--purple)', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>Night</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                      <strong>Notes:</strong> {rx.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
