import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

export default function MedicineReminders() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodaysMedicines();
  }, []);

  const fetchTodaysMedicines = async () => {
    try {
      const res = await api.get('/prescriptions/medicines/today');
      setLogs(res.data);
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
      // Update local state to reflect change immediately
      setLogs(logs.map(log => log._id === logId ? { ...log, status } : log));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update medicine status.');
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
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} /> {timeLabel}
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {items.map(log => (
            <div key={log._id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderLeft: `4px solid ${log.status === 'taken' ? 'var(--success)' : log.status === 'skipped' ? 'var(--error)' : 'var(--primary)'}` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{log.medicineName}</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                  Status: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{log.status}</span>
                </p>
                {log.prescription?.doctor?.name && (
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                    Prescribed by: Dr. {log.prescription.doctor.name}
                  </p>
                )}
              </div>
              
              {log.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button onClick={() => handleUpdateStatus(log._id, 'taken')} className="btn-primary" style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <Check size={16} /> Mark Taken
                  </button>
                  <button onClick={() => handleUpdateStatus(log._id, 'skipped')} className="btn-secondary" style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', gap: 6, color: 'var(--error)', borderColor: 'var(--error)' }}>
                    <X size={16} /> Skip
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
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">My Health</div>
          <h1 className="page-title">Today's Medicine Reminders</h1>
        </div>
      </div>

      {loading ? (
        <div>Loading reminders...</div>
      ) : error ? (
        <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={20} /> {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-gray)' }}>
          <Check size={48} style={{ margin: '0 auto 16px', color: 'var(--success)', opacity: 0.5 }} />
          <h3>No medicines scheduled for today</h3>
          <p>You're all caught up with your prescriptions.</p>
        </div>
      ) : (
        <>
          {renderMedicineList('morning', 'Morning (8:00 AM)')}
          {renderMedicineList('afternoon', 'Afternoon (2:00 PM)')}
          {renderMedicineList('night', 'Night (8:00 PM)')}
        </>
      )}
    </Layout>
  );
}
