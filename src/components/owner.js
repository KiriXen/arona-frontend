import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OwnerControls({ userData }) {
  const [repositories, setRepositories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  const repositoriesPerPage = 6;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/repositories`, { withCredentials: true })
      .then((response) => setRepositories(response.data))
      .catch((error) => console.error('Error fetching repositories:', error));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setIsModalVisible(true), 10);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setIsModalOpen(false), 300);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!link.match(/^https?:\/\/[^\s$.?#].[^\s]*$/)) {
      alert('Please enter a valid URL');
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/repositories`,
        { link, title, description },
        { withCredentials: true }
      );
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repositories`, {
        withCredentials: true,
      });
      setRepositories(response.data);
      setLink('');
      setTitle('');
      setDescription('');
      closeModal();
    } catch (error) {
      console.error('Error adding repository:', error);
      alert('Failed to add repository');
    }
  };

  const handleDelete = async (repoTitle) => {
    try {
      const token = localStorage.getItem('token') || '';
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/repositories/${encodeURIComponent(repoTitle)}`, 
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/repositories`, 
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setRepositories(response.data);
    } catch (error) {
      console.error('Error deleting repository:', error);
      alert('Failed to delete repository');
    }
  };

  const handleLogout = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/auth/logout`, { withCredentials: true })
      .then(() => (window.location.href = '/'));
  };

  if (!userData || !userData.isOwner) return null;

  const { username, isOwner, avatar } = userData;

  const indexOfLastRepo = currentPage * repositoriesPerPage;
  const indexOfFirstRepo = indexOfLastRepo - repositoriesPerPage;
  const currentRepositories = repositories.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repositories.length / repositoriesPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = 5;
    
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-8 p-4 bg-gray-800 rounded-xl shadow-lg backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Owner</h1>
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
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300 truncate">{username}</p>
                  {isOwner && <p className="text-xs text-green-400">Owner</p>}
                </div>
                <Link
                  to="/dashboard"
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
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
          {currentRepositories.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full py-8">No repositories available yet.</p>
          ) : (
            currentRepositories.map((repo) => (
              <div
                key={repo.title}
                className="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition duration-200 border border-gray-700 hover:border-blue-500"
              >
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

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getPageNumbers().map((number, index) => (
                number === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } transition-colors duration-200`}
                  >
                    {number}
                  </button>
                )
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
        {repositories.length > 0 && (
          <div className="text-center mt-2 text-sm text-gray-400">
            Showing {indexOfFirstRepo + 1}-{Math.min(indexOfLastRepo, repositories.length)} of {repositories.length} repositories
          </div>
        )}
      </div>

      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center z-40 transform hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {isModalOpen && (
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 ${
            isModalVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
        >
          <div 
            ref={modalRef}
            className={`bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md transition-all duration-300 transform ${
              isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Add Repository</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">Repository Link</label>
                <input
                  id="link"
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Repository Title"
                  className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of this repository"
                  className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerControls;