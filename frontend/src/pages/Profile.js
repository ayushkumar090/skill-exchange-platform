import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SkillCard from '../components/SkillCard';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`text-lg ${star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>
        ★
      </span>
    ))}
    <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">({rating?.toFixed(1) || '0.0'})</span>
  </div>
);

const roleLabels = { both: 'Provider & Learner', provider: 'Provider', learner: 'Learner' };
const roleColors = {
  both: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  provider: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  learner: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user?.bio || '', role: user?.role || 'both' });
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/skills/user');
        setUserSkills(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSkills();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.slice(0, 2)?.toUpperCase() || '??';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-heading mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="card p-6 mb-6">
        {/* Avatar + header */}
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.username}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
                className={editing ? 'btn-ghost' : 'btn-primary'}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <div className="mt-2">
              <StarRating rating={user?.overallRating || 0} />
            </div>
          </div>
        </div>

        {success && <div className="alert-success mb-4">{success}</div>}
        {error && <div className="alert-error mb-4">{error}</div>}

        {editing ? (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-5">
            <div>
              <label className="form-label">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="form-input resize-none"
                placeholder="Tell the community about yourself…"
              />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="form-input"
              >
                <option value="both">Both (Provider & Learner)</option>
                <option value="provider">Provider</option>
                <option value="learner">Learner</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={loading} className="btn-success">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-1">Bio</p>
              <p className="text-slate-700 dark:text-slate-300">
                {user?.bio || <span className="italic text-slate-400">No bio yet</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-1">Role</p>
              <span className={`badge ${roleColors[user?.role] || 'bg-slate-100 text-slate-700'}`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="section-heading mb-4">My Skills ({userSkills.length})</h2>
        {userSkills.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 italic text-sm">
            No skills added yet.{' '}
            <a href="/skills" className="text-primary-600 dark:text-primary-400 hover:underline">Add your first skill!</a>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userSkills.map((us) => <SkillCard key={us._id} userSkill={us} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
