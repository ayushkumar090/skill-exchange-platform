import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ title, value, icon, color, link }) => (
  <Link
    to={link}
    className={`bg-white/80 backdrop-blur rounded-2xl shadow-md p-6 flex items-center gap-4 border border-white/60 ${color} hover:shadow-xl hover:-translate-y-0.5 transition-all`}
  >
    <div className="text-3xl bg-gradient-to-br from-white to-blue-50 rounded-2xl p-3 shadow-sm">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 bg-white/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-white/60">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your skill community.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">Community-powered learning</span>
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Match, meet, grow</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="My Skills" value={stats.skills} icon="🎯" color="border-l-4 border-blue-500" link="/skills" />
          <StatCard title="Pending Requests" value={stats.pendingRequests} icon="📩" color="border-l-4 border-yellow-500" link="/requests" />
          <StatCard title="Active Exchanges" value={stats.activeExchanges} icon="🤝" color="border-l-4 border-green-500" link="/exchanges" />
          <StatCard title="Unread Messages" value={stats.unreadMessages} icon="💬" color="border-l-4 border-purple-500" link="/messages" />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'My Skills', to: '/skills', emoji: '🎯' },
            { label: 'Browse Library', to: '/skills', emoji: '📚' },
            { label: 'Requests', to: '/requests', emoji: '📩' },
            { label: 'Exchanges', to: '/exchanges', emoji: '🤝' },
            { label: 'Feedback', to: '/feedback', emoji: '⭐' },
            { label: 'Messages', to: '/messages', emoji: '💬' },
          ].map(({ label, to, emoji }) => (
            <Link
              key={label}
              to={to}
              className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-4 text-center hover:shadow-lg hover:-translate-y-0.5 hover:bg-white transition-all border border-white/60"
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
