import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RequestCard from '../components/RequestCard';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userSkillNeededId: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setRequests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.userSkillNeededId || !form.message) { setError('Please select a skill and enter a message'); return; }
    try {
      await api.post('/requests', form);
      setSuccess('Request sent successfully!');
      setShowForm(false);
      setForm({ userSkillNeededId: '', message: '' });
      fetchRequests();
    } catch (err) { setError(err.response?.data?.error || 'Failed to send request'); }
  };

  const handleAccept = async (id) => {
    try { await api.put(`/requests/${id}`, { status: 'Accepted' }); setSuccess('Request accepted!'); fetchRequests(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update request'); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/requests/${id}`, { status: 'Rejected' }); setSuccess('Request rejected.'); fetchRequests(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update request'); }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Skill Requests</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">
          + New Request
        </button>
      </div>

      {success && <div className="alert-success mb-4">{success}</div>}
      {error && <div className="alert-error mb-4">{error}</div>}

      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-primary-500">
          <h2 className="section-heading mb-4">New Skill Request</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">UserSkill ID of the skill you need</label>
              <input type="text" value={form.userSkillNeededId}
                onChange={(e) => setForm({ ...form, userSkillNeededId: e.target.value })}
                className="form-input" placeholder="Paste UserSkill ID here" />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Go to Skills → Library, hover a skill to see its ID, or ask a neighbor to share their skill ID.</p>
            </div>
            <div>
              <label className="form-label">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3} className="form-input resize-none"
                placeholder="Introduce yourself and explain what you'd like to learn…" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">Send Request</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner h-10 w-10"></div></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <div className="text-6xl mb-4" aria-hidden="true">📩</div>
          <p className="text-lg font-medium">No requests yet</p>
          <p className="text-sm mt-1">Send a request to learn a skill from a neighbor!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req}
              currentUserId={user?._id || user?.id}
              onAccept={handleAccept} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;

