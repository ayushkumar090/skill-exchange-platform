import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '', role: 'both' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('Username, email, and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.bio, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">⚡</span>
          <p className="text-white/70 text-sm mt-2 font-medium tracking-wider uppercase">Skill Exchange</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Join the Skill Exchange community</p>
          </div>

          {error && <div className="alert-error mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-username" className="form-label">Username</label>
              <input id="reg-username" type="text" name="username" value={form.username} onChange={handleChange}
                className="form-input" placeholder="your_username" autoComplete="username" />
            </div>
            <div>
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input id="reg-password" type="password" name="password" value={form.password} onChange={handleChange}
                className="form-input" placeholder="Min. 6 characters" autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="reg-bio" className="form-label">
                Bio <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea id="reg-bio" name="bio" value={form.bio} onChange={handleChange}
                rows={3} className="form-input resize-none"
                placeholder="Tell the community about yourself…" />
            </div>
            <div>
              <label htmlFor="reg-role" className="form-label">Role</label>
              <select id="reg-role" name="role" value={form.role} onChange={handleChange} className="form-input">
                <option value="both">Both (Provider & Learner)</option>
                <option value="provider">Provider</option>
                <option value="learner">Learner</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner h-4 w-4"></span>Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

