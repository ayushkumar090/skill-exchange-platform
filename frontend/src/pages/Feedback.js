import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-2xl transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ))}
  </div>
);

const Feedback = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ exchangeId: '', rating: 5, detailedReview: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchanges');
      const completed = res.data.data.filter((e) => e.completedStatus);
      setExchanges(completed);

      const map = {};
      await Promise.all(
        completed.map(async (ex) => {
          try {
            const fbRes = await api.get(`/feedback/${ex._id}`);
            map[ex._id] = fbRes.data.data;
          } catch {
            map[ex._id] = [];
          }
        })
      );
      setFeedbackMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.exchangeId) {
      setError('Please select an exchange');
      return;
    }
    try {
      await api.post('/feedback', form);
      setSuccess('Feedback submitted!');
      setShowForm(false);
      setForm({ exchangeId: '', rating: 5, detailedReview: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const hasGivenFeedback = (exchangeId) => {
    const feedbacks = feedbackMap[exchangeId] || [];
    return feedbacks.some((f) => f.givenByUserId?._id === currentUserId || f.givenByUserId === currentUserId);
  };

  const avgRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return null;
    return feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Feedback</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Leave Feedback
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Submit Feedback</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exchange</label>
              <select
                value={form.exchangeId}
                onChange={(e) => setForm({ ...form, exchangeId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select a completed exchange</option>
                {exchanges.filter((e) => !hasGivenFeedback(e._id)).map((ex) => {
                  const isOffer = ex.offerUserId?._id === currentUserId || ex.offerUserId === currentUserId;
                  const partner = isOffer ? ex.recipientUserId : ex.offerUserId;
                  const skill = ex.requestId?.userSkillNeededId?.skillId;
                  return (
                    <option key={ex._id} value={ex._id}>
                      with {partner?.username || 'Unknown'} — {skill?.skillName || 'Skill'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <StarPicker value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
              <textarea
                value={form.detailedReview}
                onChange={(e) => setForm({ ...form, detailedReview: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Submit</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">⭐</div>
          <p className="text-lg">No completed exchanges yet</p>
          <p className="text-sm mt-1">Complete an exchange to leave feedback.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exchanges.map((ex) => {
            const isOffer = ex.offerUserId?._id === currentUserId || ex.offerUserId === currentUserId;
            const partner = isOffer ? ex.recipientUserId : ex.offerUserId;
            const skill = ex.requestId?.userSkillNeededId?.skillId;
            const feedbacks = feedbackMap[ex._id] || [];
            const avg = avgRating(feedbacks);

            return (
              <div key={ex._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Exchange with {partner?.username || 'Unknown'} — {skill?.skillName || 'Skill'}
                    </h3>
                    {avg !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarDisplay rating={avg} />
                        <span className="text-sm text-gray-500">{avg.toFixed(1)} avg ({feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''})</span>
                      </div>
                    )}
                  </div>
                  {!hasGivenFeedback(ex._id) && (
                    <button
                      onClick={() => { setForm({ ...form, exchangeId: ex._id }); setShowForm(true); }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
                {feedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div key={fb._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <StarDisplay rating={fb.rating} />
                          <span className="text-sm font-medium text-gray-700">{fb.givenByUserId?.username}</span>
                        </div>
                        {fb.detailedReview && <p className="text-sm text-gray-600 italic">"{fb.detailedReview}"</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No feedback yet for this exchange.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feedback;
