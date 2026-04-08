import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ExchangeCard = ({ exchange, currentUserId, onComplete }) => {
  const isOffer = exchange.offerUserId?._id === currentUserId || exchange.offerUserId === currentUserId;
  const partner = isOffer ? exchange.recipientUserId : exchange.offerUserId;
  const skill = exchange.requestId?.userSkillNeededId?.skillId;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{isOffer ? 'You are offering to' : 'You are learning from'}</p>
          <p className="font-semibold text-gray-800">{partner?.username || 'Unknown'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${exchange.completedStatus ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {exchange.completedStatus ? 'Completed' : 'Active'}
        </span>
      </div>
      {skill && (
        <div className="mb-3">
          <p className="text-sm text-gray-500">Skill</p>
          <p className="font-medium text-gray-700">{skill.skillName}</p>
          <p className="text-xs text-gray-400">{skill.category}</p>
        </div>
      )}
      {exchange.scheduledTime && (
        <div className="mb-2">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-gray-700 text-sm">{new Date(exchange.scheduledTime).toLocaleString()}</p>
        </div>
      )}
      {exchange.duration && (
        <div className="mb-3">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-gray-700 text-sm">{exchange.duration} minutes</p>
        </div>
      )}
      {!exchange.completedStatus && (
        <button
          onClick={() => onComplete(exchange._id)}
          className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
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

  useEffect(() => {
    fetchExchanges();
    fetchAcceptedRequests();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchanges');
      setExchanges(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedRequests = async () => {
    try {
      const res = await api.get('/requests');
      setAcceptedRequests(res.data.data.filter((r) => r.status === 'Accepted'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.requestId || !form.offerUserId || !form.recipientUserId) {
      setError('Request, offer user, and recipient user are required');
      return;
    }
    try {
      await api.post('/exchanges', {
        ...form,
        duration: form.duration ? parseInt(form.duration) : undefined,
      });
      setSuccess('Exchange created!');
      setShowForm(false);
      fetchExchanges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exchange');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this exchange as complete?')) return;
    try {
      await api.put(`/exchanges/${id}/complete`);
      setSuccess('Exchange marked as complete!');
      fetchExchanges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete exchange');
    }
  };

  const active = exchanges.filter((e) => !e.completedStatus);
  const completed = exchanges.filter((e) => e.completedStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Skill Exchanges</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Create Exchange
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Exchange</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accepted Request</label>
              <select
                value={form.requestId}
                onChange={(e) => {
                  const req = acceptedRequests.find((r) => r._id === e.target.value);
                  setForm({
                    ...form,
                    requestId: e.target.value,
                    offerUserId: req?.userSkillNeededId?.userId?._id || req?.userSkillNeededId?.userId || '',
                    recipientUserId: req?.senderUserId?._id || req?.senderUserId || '',
                  });
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes, optional)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. 60"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Active ({active.length})</h2>
            {active.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No active exchanges.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((ex) => <ExchangeCard key={ex._id} exchange={ex} currentUserId={currentUserId} onComplete={handleComplete} />)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Completed ({completed.length})</h2>
            {completed.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No completed exchanges yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((ex) => <ExchangeCard key={ex._id} exchange={ex} currentUserId={currentUserId} onComplete={handleComplete} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Exchanges;
