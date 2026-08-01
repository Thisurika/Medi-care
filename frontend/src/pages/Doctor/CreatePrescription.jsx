import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Plus, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function CreatePrescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPatientId = searchParams.get('patientId') || '';
  const initialApptId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [appointmentId, setAppointmentId] = useState(initialApptId);
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', instructions: '', durationDays: 1, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], timing: { morning: false, afternoon: false, night: false } }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch patients for the doctor to select if they didn't come from an appointment
    api.get('/users?role=patient')
      .then(res => setPatients(res.data.users || res.data.data || res.data))
      .catch(err => console.error('Failed to load patients', err));
  }, []);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', instructions: '', durationDays: 1, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], timing: { morning: false, afternoon: false, night: false } }]);
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...medicines];
    updated.splice(index, 1);
    setMedicines(updated);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    if (field.includes('timing.')) {
      const timingField = field.split('.')[1];
      updated[index].timing[timingField] = value;
    } else {
      updated[index][field] = value;
      // Auto-calculate end date based on duration
      if (field === 'durationDays' || field === 'startDate') {
        const start = new Date(updated[index].startDate);
        const duration = parseInt(updated[index].durationDays, 10) || 1;
        start.setDate(start.getDate() + (duration - 1));
        updated[index].endDate = start.toISOString().split('T')[0];
      }
    }
    setMedicines(updated);
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
      const res = await api.post('/prescriptions', {
        patientId,
        appointmentId: appointmentId || undefined,
        medicines,
        notes
      });
      navigate(`/dashboard`, { state: { message: 'Prescription created successfully' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 20 }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: '6px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Create Prescription</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="form-label">Select Patient</label>
            <select className="form-input" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">-- Select Patient --</option>
              {Array.isArray(patients) && patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Medicines</h3>
              <button type="button" className="btn-primary" onClick={handleAddMedicine} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <Plus size={16} /> Add Medicine
              </button>
            </div>
            
            {medicines.map((med, index) => (
              <div key={index} style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 8, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-light)' }}>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => handleRemoveMedicine(index)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--error)' }}>
                    <Trash2 size={20} />
                  </button>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Medicine Name</label>
                    <input type="text" className="form-input" value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} placeholder="e.g. Paracetamol" required />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Dosage</label>
                    <input type="text" className="form-input" value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} placeholder="e.g. 500mg, 1 Tablet" required />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Instructions</label>
                  <input type="text" className="form-input" value={med.instructions} onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)} placeholder="e.g. After food" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Start Date</label>
                    <input type="date" className="form-input" value={med.startDate} onChange={(e) => handleMedicineChange(index, 'startDate', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration (Days)</label>
                    <input type="number" min="1" className="form-input" value={med.durationDays} onChange={(e) => handleMedicineChange(index, 'durationDays', e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Timing</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={med.timing.morning} onChange={(e) => handleMedicineChange(index, 'timing.morning', e.target.checked)} />
                      Morning
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={med.timing.afternoon} onChange={(e) => handleMedicineChange(index, 'timing.afternoon', e.target.checked)} />
                      Afternoon
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={med.timing.night} onChange={(e) => handleMedicineChange(index, 'timing.night', e.target.checked)} />
                      Night
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="form-label">Consultation Notes (Optional)</label>
            <textarea className="form-input" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write any additional notes for the patient here..."></textarea>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}>
            {loading ? 'Creating...' : <><CheckCircle size={20} /> Save Prescription</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
