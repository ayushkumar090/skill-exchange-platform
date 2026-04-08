import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SkillCard from '../components/SkillCard';

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-1">({rating?.toFixed(1) || '0.0'})</span>
    </div>
  );
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{user?.username}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Overall Rating</p>
          <StarRating rating={user?.overallRating || 0} />
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm mb-4">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell the community about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both (Provider & Learner)</option>
                <option value="provider">Provider</option>
                <option value="learner">Learner</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-gray-700">{user?.bio || <span className="italic text-gray-400">No bio yet</span>}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">{user?.role}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Skills ({userSkills.length})</h2>
        {userSkills.length === 0 ? (
          <p className="text-gray-400 italic">No skills added yet. <a href="/skills" className="text-blue-600 hover:underline">Add your first skill!</a></p>
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
