import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard({ userData }) {
  const [botStats, setBotStats] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/bot-stats`)
      .then(response => setBotStats(response.data))
      .catch(error => console.error('Error fetching bot stats:', error));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  if (!userData) return null;

  const { username, isOwner, avatar } = userData;

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-8 p-4 bg-gray-800 rounded-xl shadow-lg backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Bot Dashboard</h1>
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          <span className="text-gray-300 font-medium hidden md:block">
            {username} {isOwner && <span className="text-green-400">(Owner)</span>}
          </span>
          <div className="relative">
            <img
              src={avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-gray-600 cursor-pointer hover:border-blue-500 transition-all duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300 truncate">{username}</p>
                  {isOwner && <p className="text-xs text-green-400">Owner</p>}
                </div>
                {isOwner && (
                  <Link 
                    to="/owner" 
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                    onClick={() => console.log('Navigating to /owner via Link')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Owner Controls</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-4">Bot Statistics</h2>
        {botStats ? (
          <div className="p-6 bg-gray-800 rounded-xl shadow-md border border-gray-700">
            <p className="text-gray-300 mb-2"><span className="font-medium text-white">Commands:</span> {botStats.commandCount}</p>
            <p className="text-gray-300 mb-2"><span className="font-medium text-white">Uptime:</span> {botStats.uptime}</p>
            <p className="text-gray-300 mb-2"><span className="font-medium text-white">Servers:</span> {botStats.serverCount}</p>
            <p className="text-gray-300 mb-2"><span className="font-medium text-white">Users:</span> {botStats.userCount}</p>
            <p className="text-gray-300"><span className="font-medium text-white">Guild Members:</span> {botStats.guildMemberCount}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Loading bot statistics...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;