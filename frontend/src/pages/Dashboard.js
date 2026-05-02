import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statCards = [
  { key: 'skills',          title: 'My Skills',         icon: '🎯', gradient: 'from-primary-500 to-primary-600',   link: '/skills' },
  { key: 'pendingRequests', title: 'Pending Requests',  icon: '📩', gradient: 'from-amber-500 to-amber-600',       link: '/requests' },
  { key: 'activeExchanges', title: 'Active Exchanges',  icon: '🤝', gradient: 'from-emerald-500 to-emerald-600',   link: '/exchanges' },
  { key: 'unreadMessages',  title: 'Messages',          icon: '💬', gradient: 'from-violet-500 to-violet-600',     link: '/messages' },
];

const quickActions = [
  { label: 'My Skills',       to: '/skills',    emoji: '🎯', desc: 'View & manage' },
  { label: 'Skill Library',   to: '/skills',    emoji: '📚', desc: 'Browse all skills' },
  { label: 'Requests',        to: '/requests',  emoji: '📩', desc: 'Incoming & sent' },
  { label: 'Exchanges',       to: '/exchanges', emoji: '🤝', desc: 'Active sessions' },
  { label: 'Feedback',        to: '/feedback',  emoji: '⭐', desc: 'Ratings & reviews' },
  { label: 'Messages',        to: '/messages',  emoji: '💬', desc: 'Chat with partners' },
];

const StatCard = ({ title, value, icon, gradient, link, loading }) => (
  <Link
    to={link}
    className="card card-hover flex items-center gap-4 p-5 overflow-hidden relative group"
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
      <span aria-hidden="true">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {loading ? (
        <div className="h-8 w-10 mt-1 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
      ) : (
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      )}
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ skills: 0, pendingRequests: 0, activeExchanges: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skillsRes, requestsRes, exchangesRes] = await Promise.all([
          api.get('/skills/user'),
          api.get('/requests'),
          api.get('/exchanges'),
        ]);
        const pendingRequests = requestsRes.data.data.filter((r) => r.status === 'Pending').length;
        const activeExchanges = exchangesRes.data.data.filter((e) => !e.completedStatus).length;
        setStats({
          skills: skillsRes.data.data.length,
          pendingRequests,
          activeExchanges,
          unreadMessages: 0,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      {/* Welcome hero */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/5"></div>
        </div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-primary-100 mt-1 text-sm sm:text-base">
            Here's what's happening in your skill community today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ key, ...rest }) => (
          <StatCard key={key} value={stats[key]} loading={loading} {...rest} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-heading mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, to, emoji, desc }) => (
            <Link
              key={label}
              to={to}
              className="card card-hover p-4 text-center group flex flex-col items-center gap-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200" aria-hidden="true">{emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
