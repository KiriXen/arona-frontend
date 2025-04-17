import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';

function Dashboard({ userData }) {
  const [botStats, setBotStats] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/bot-stats`)
      .then(response => setBotStats(response.data))
      .catch(error => console.error('Error fetching bot stats:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen p-6">
      <Header title="Dashboard" userData={userData} handleLogout={handleLogout} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6 animate-slide-in">Bot Statistics</h2>
        {botStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Commands', value: botStats.commandCount },
              { label: 'Uptime', value: botStats.uptime },
              { label: 'Servers', value: botStats.serverCount },
              { label: 'Users', value: botStats.userCount },
              { label: 'Guild Members', value: botStats.guildMemberCount },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="p-6 bg-gray-800/90 rounded-xl shadow-md border border-gray-700 hover:border-indigo-500 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-medium text-white mb-2">{stat.label}</h3>
                <p className="text-2xl text-indigo-400">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
            <p className="text-gray-400">Loading bot statistics...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;