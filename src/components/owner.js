import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OwnerControls({ userData }) {
  const [repositories, setRepositories] = useState([]);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/repositories`, { withCredentials: true })
      .then(response => setRepositories(response.data))
      .catch(error => console.error('Error fetching repositories:', error));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!link.match(/^https?:\/\/[^\s$.?#].[^\s]*$/)) {
      alert('Please enter a valid URL');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/repositories`, {
        link,
        title,
        description
      }, { withCredentials: true });
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repositories`, { withCredentials: true });
      setRepositories(response.data);
      setLink('');
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error adding repository:', error);
      alert('Failed to add repository');
    }
  };

  const handleDelete = async (repoTitle) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/repositories/${encodeURIComponent(repoTitle)}`, {
        withCredentials: true
      });
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repositories`, { withCredentials: true });
      setRepositories(response.data);
    } catch (error) {
      console.error('Error deleting repository:', error);
      alert('Failed to delete repository');
    }
  };

  const handleLogout = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/auth/logout`, { withCredentials: true })
      .then(() => window.location.href = '/');
  };

  if (!userData || !userData.isOwner) return null;

  const { username, isOwner, avatar } = userData;

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-8 p-4 bg-gray-800 rounded-xl shadow-lg backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Owner Controls</h1>
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
                <Link
                  to="/dashboard"
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
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
        <h2 className="text-2xl font-semibold text-white mb-4">Repositories</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {repositories.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full py-8">No repositories available yet.</p>
          ) : (
            repositories.map(repo => (
              <div key={repo.title} className="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition duration-200 border border-gray-700 hover:border-blue-500">
                <h3 className="text-xl font-medium text-white">{repo.title}</h3>
                <p className="text-gray-300 mt-1">{repo.description || 'No description'}</p>
                <div className="mt-3 flex space-x-4">
                  <a
                    href={repo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    View Repository
                  </a>
                  <button
                    onClick={() => handleDelete(repo.title)}
                    className="text-red-400 hover:text-red-300 hover:underline focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 p-6 bg-gray-800 rounded-xl shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-white mb-6">Manage Repositories</h2>
          <form onSubmit={handleAdd} className="mb-8">
            <h3 className="text-xl font-medium text-white mb-3">Add Repository</h3>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Repository Link"
              className="w-full p-3 mb-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 mb-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-3 mb-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              Add Repository
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerControls;