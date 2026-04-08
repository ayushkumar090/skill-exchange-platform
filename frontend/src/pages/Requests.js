import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RequestCard from '../components/RequestCard';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userSkillNeededId: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [allOfferingSkills, setAllOfferingSkills] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchSkills();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const myRes = await api.get('/skills/user');
      setUserSkills(myRes.data.data);
      setAllOfferingSkills(myRes.data.data.filter((s) => s.status === 'Offering'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.userSkillNeededId || !form.message) {
      setError('Please select a skill and enter a message');
      return;
    }
    try {
      await api.post('/requests', form);
      setSuccess('Request sent successfully!');
      setShowForm(false);
      setForm({ userSkillNeededId: '', message: '' });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'Accepted' });
      setSuccess('Request accepted!');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'Rejected' });
      setSuccess('Request rejected.');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Skill Requests</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Request
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">New Skill Request</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill You Need (from your Offering skills of other users — enter a UserSkill ID)</label>
              <input
                type="text"
                value={form.userSkillNeededId}
                onChange={(e) => setForm({ ...form, userSkillNeededId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="UserSkill ID of the skill you need"
              />
              <p className="text-xs text-gray-400 mt-1">Go to Skills → Library, hover a skill to see its ID, or ask a neighbor to share their skill ID.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                placeholder="Introduce yourself and explain what you'd like to learn..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Send Request
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📩</div>
          <p className="text-lg">No requests yet</p>
          <p className="text-sm mt-1">Send a request to learn a skill from a neighbor!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <RequestCard
              key={req._id}
              request={req}
              currentUserId={user?._id || user?.id}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
