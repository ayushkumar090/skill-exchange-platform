import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusBadge = {
  Active:    'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const ExchangeCard = ({ exchange, currentUserId, onComplete }) => {
  const isOffer = exchange.offerUserId?._id === currentUserId || exchange.offerUserId === currentUserId;
  const partner = isOffer ? exchange.recipientUserId : exchange.offerUserId;
  const skill = exchange.requestId?.userSkillNeededId?.skillId;
  const status = exchange.completedStatus ? 'Completed' : 'Active';

  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
            {partner?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mb-0.5">
              {isOffer ? 'You are offering to' : 'You are learning from'}
            </p>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{partner?.username || 'Unknown'}</p>
          </div>
        </div>
        <span className={`badge ${statusBadge[status]}`}>{status}</span>
      </div>

      {skill && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Skill</p>
          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{skill.skillName}</p>
          {skill.category && <p className="text-xs text-slate-400 dark:text-slate-500">{skill.category}</p>}
        </div>
      )}

      {(exchange.scheduledTime || exchange.duration) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {exchange.scheduledTime && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled</p>
              <p className="text-slate-700 dark:text-slate-300">{new Date(exchange.scheduledTime).toLocaleString()}</p>
            </div>
          )}
          {exchange.duration && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
              <p className="text-slate-700 dark:text-slate-300">{exchange.duration} min</p>
            </div>
          )}
        </div>
      )}

      {!exchange.completedStatus && (
        <button onClick={() => onComplete(exchange._id)} className="btn-success w-full mt-auto">
          Mark as Complete
        </button>
      )}
    </div>
  );
};

const Exchanges = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ requestId: '', offerUserId: '', recipientUserId: '', scheduledTime: '', duration: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id || user?.id;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchExchanges(); fetchAcceptedRequests(); }, []);

  const fetchExchanges = async () => {
    try { setLoading(true); const res = await api.get('/exchanges'); setExchanges(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAcceptedRequests = async () => {
    try { const res = await api.get('/requests'); setAcceptedRequests(res.data.data.filter((r) => r.status === 'Accepted')); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.requestId || !form.offerUserId || !form.recipientUserId) { setError('Request, offer user, and recipient user are required'); return; }
    try {
      await api.post('/exchanges', { ...form, duration: form.duration ? parseInt(form.duration, 10) : undefined });
      setSuccess('Exchange created!'); setShowForm(false); fetchExchanges();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create exchange'); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this exchange as complete?')) return;
    try { await api.put(`/exchanges/${id}/complete`); setSuccess('Exchange marked as complete!'); fetchExchanges(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to complete exchange'); }
  };

  const active = exchanges.filter((e) => !e.completedStatus);
  const completed = exchanges.filter((e) => e.completedStatus);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Skill Exchanges</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">+ Create Exchange</button>
      </div>

      {success && <div className="alert-success mb-4">{success}</div>}
      {error && <div className="alert-error mb-4">{error}</div>}

      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-primary-500">
          <h2 className="section-heading mb-4">Create New Exchange</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Accepted Request</label>
              <select value={form.requestId}
                onChange={(e) => {
                  const req = acceptedRequests.find((r) => r._id === e.target.value);
                  setForm({ ...form, requestId: e.target.value,
                    offerUserId: req?.userSkillNeededId?.userId?._id || req?.userSkillNeededId?.userId || '',
                    recipientUserId: req?.senderUserId?._id || req?.senderUserId || '' });
                }}
                className="form-input">
                <option value="">Select an accepted request</option>
                {acceptedRequests.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.senderUserId?.username} → {r.userSkillNeededId?.skillId?.skillName || 'Unknown Skill'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Scheduled Time <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="datetime-local" value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Duration (minutes) <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="number" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="form-input" placeholder="e.g. 60" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="btn-primary">Create</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner h-10 w-10"></div></div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="section-heading mb-4">Active ({active.length})</h2>
            {active.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 italic text-sm">No active exchanges.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((ex) => <ExchangeCard key={ex._id} exchange={ex} currentUserId={currentUserId} onComplete={handleComplete} />)}
              </div>
            )}
          </section>
          <section>
            <h2 className="section-heading mb-4">Completed ({completed.length})</h2>
            {completed.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 italic text-sm">No completed exchanges yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((ex) => <ExchangeCard key={ex._id} exchange={ex} currentUserId={currentUserId} onComplete={handleComplete} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Exchanges;

