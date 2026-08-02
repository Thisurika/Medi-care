import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Clock, Check, X, AlertCircle, Pill, FileText, Download, User } from 'lucide-react';

export default function MedicineReminders() {
  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' | 'prescriptions'
  const [logs, setLogs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, rxRes] = await Promise.all([
        api.get('/prescriptions/medicines/today'),
        api.get('/prescriptions'),
      ]);
      setLogs(logsRes.data || []);
      setPrescriptions(rxRes.data || []);
    } catch (err) {
      setError('Failed to fetch medicine reminders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (logId, status) => {
    try {
      await api.put(`/prescriptions/medicines/${logId}`, { status });
      setLogs(logs.map(log => log._id === logId ? { ...log, status } : log));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update medicine status.');
    }
  };

  const handleDownloadPDF = async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download PDF', err);
      alert('Failed to download prescription PDF.');
    }
  };

  // Group logs by time of day
  const groupedLogs = {
    morning: logs.filter(l => l.timeOfDay === 'morning'),
    afternoon: logs.filter(l => l.timeOfDay === 'afternoon'),
    night: logs.filter(l => l.timeOfDay === 'night'),
  };

  const renderMedicineList = (timeOfDay, timeLabel) => {
    const items = groupedLogs[timeOfDay];
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} /> {timeLabel}
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {items.map(log => (
            <div key={log._id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, borderLeft: `4px solid ${log.status === 'taken' ? 'var(--emerald)' : log.status === 'skipped' ? 'var(--red)' : 'var(--primary)'}` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{log.medicineName}</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Status: <span style={{ fontWeight: 600, textTransform: 'capitalize', color: log.status === 'taken' ? 'var(--emerald)' : log.status === 'skipped' ? 'var(--red)' : 'var(--amber)' }}>{log.status}</span>
                </p>
                {log.prescription?.doctor?.name && (
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Prescribed by: Dr. {log.prescription.doctor.name}
                  </p>
                )}
              </div>
              
              {log.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button onClick={() => handleUpdateStatus(log._id, 'taken')} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <Check size={14} /> Mark Taken
                  </button>
                  <button onClick={() => handleUpdateStatus(log._id, 'skipped')} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', color: 'var(--red)', borderColor: 'var(--red)' }}>
                    <X size={14} /> Skip
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-breadcrumb">My Health</div>
          <h1 className="page-title">Medicines & Prescriptions</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button
          className={`btn ${activeTab === 'reminders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reminders')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Clock size={15} /> Today's Reminders ({logs.length})
        </button>
        <button
          className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('prescriptions')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <FileText size={15} /> All Prescriptions ({prescriptions.length})
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : activeTab === 'reminders' ? (
        logs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <Check size={48} style={{ margin: '0 auto 16px', color: 'var(--emerald)', opacity: 0.7 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No medicines scheduled for today</h3>
            <p style={{ fontSize: 13 }}>You're all caught up with your daily medicine schedule.</p>
            {prescriptions.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('prescriptions')} style={{ marginTop: 16 }}>
                View All Prescriptions
              </button>
            )}
          </div>
        ) : (
          <>
            {renderMedicineList('morning', 'Morning (8:00 AM)')}
            {renderMedicineList('afternoon', 'Afternoon (2:00 PM)')}
            {renderMedicineList('night', 'Night (8:00 PM)')}
          </>
        )
      ) : (
        /* Prescriptions Tab */
        prescriptions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <Pill size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No prescriptions found</h3>
            <p style={{ fontSize: 13 }}>Your doctor will add prescriptions here after your consultation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {prescriptions.map((rx) => (
              <div key={rx._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={16} style={{ color: 'var(--primary)' }} /> Dr. {rx.doctor?.name || 'Unknown'}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Issued on {new Date(rx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownloadPDF(rx._id)}
                    title="Download PDF Prescription"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>

                {/* Medicines list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {rx.medicines.map((med, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                          {med.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>({med.dosage})</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {med.durationDays} day{med.durationDays !== 1 ? 's' : ''}
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
                    <strong>Doctor's Notes:</strong> {rx.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </Layout>
  );
}
