import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1" role="group" aria-label="Rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        className={`text-2xl transition-all duration-150 hover:scale-125 ${
          star <= value ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'} aria-hidden="true">★</span>
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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchanges');
      const completed = res.data.data.filter((e) => e.completedStatus);
      setExchanges(completed);
      const map = {};
      await Promise.all(completed.map(async (ex) => {
        try { const fbRes = await api.get(`/feedback/${ex._id}`); map[ex._id] = fbRes.data.data; }
        catch { map[ex._id] = []; }
      }));
      setFeedbackMap(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.exchangeId) { setError('Please select an exchange'); return; }
    try {
      await api.post('/feedback', form);
      setSuccess('Feedback submitted!');
      setShowForm(false);
      setForm({ exchangeId: '', rating: 5, detailedReview: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to submit feedback'); }
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
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Feedback</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">
          + Leave Feedback
        </button>
      </div>

      {success && <div className="alert-success mb-4">{success}</div>}
      {error && <div className="alert-error mb-4">{error}</div>}

      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-primary-500">
          <h2 className="section-heading mb-4">Submit Feedback</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Exchange</label>
              <select value={form.exchangeId} onChange={(e) => setForm({ ...form, exchangeId: e.target.value })} className="form-input">
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
              <label className="form-label">Rating</label>
              <StarPicker value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="form-label">Review <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={form.detailedReview} onChange={(e) => setForm({ ...form, detailedReview: e.target.value })}
                rows={3} className="form-input resize-none" placeholder="Share your experience…" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">Submit</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner h-10 w-10"></div></div>
      ) : exchanges.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <div className="text-6xl mb-4" aria-hidden="true">⭐</div>
          <p className="text-lg font-medium">No completed exchanges yet</p>
          <p className="text-sm mt-1">Complete an exchange to leave feedback.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {exchanges.map((ex) => {
            const isOffer = ex.offerUserId?._id === currentUserId || ex.offerUserId === currentUserId;
            const partner = isOffer ? ex.recipientUserId : ex.offerUserId;
            const skill = ex.requestId?.userSkillNeededId?.skillId;
            const feedbacks = feedbackMap[ex._id] || [];
            const avg = avgRating(feedbacks);

            return (
              <div key={ex._id} className="card p-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Exchange with {partner?.username || 'Unknown'} — {skill?.skillName || 'Skill'}
                    </h3>
                    {avg !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarDisplay rating={avg} />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {avg.toFixed(1)} avg ({feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}
                  </div>
                  {!hasGivenFeedback(ex._id) && (
                    <button
                      onClick={() => { setForm({ ...form, exchangeId: ex._id }); setShowForm(true); }}
                      className="btn-primary py-1.5 text-xs"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>

                {feedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div key={fb._id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <StarDisplay rating={fb.rating} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{fb.givenByUserId?.username}</span>
                        </div>
                        {fb.detailedReview && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{fb.detailedReview}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">No feedback yet for this exchange.</p>
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

