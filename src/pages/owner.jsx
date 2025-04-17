import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../components/header';

function OwnerControls({ userData }) {
  const [repositories, setRepositories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const modalRef = useRef(null);
  const repositoriesPerPage = 6;

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/repositories`, 
        { withCredentials: true }
      );
      setRepositories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError(true);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRepositories();
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    fetchRepositories();

    const handleClickOutside = (event) => {
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
      console.error('Error adding code:', error);
      alert('Failed to add code');
    }
  };

  const handleDelete = async (repoTitle) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
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
      console.error('Error deleting code:', error);
      alert('Failed to delete code');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  if (!userData || !userData.isOwner) return null;

  const indexOfLastRepo = currentPage * repositoriesPerPage;
  const indexOfFirstRepo = indexOfLastRepo - repositoriesPerPage;
  const currentRepositories = repositories.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repositories.length / repositoriesPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = window.innerWidth < 640 ? 3 : 5;
    
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-gray-400 text-center col-span-full py-12 animate-fade-in">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
          <p>Loading source codes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-gray-400 text-center col-span-full py-12 animate-fade-in">
          <p className="mb-4">Failed to load source codes.</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 inline-flex items-center space-x-2"
            disabled={refreshing}
          >
            <svg 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Retrying...' : 'Retry'}</span>
          </button>
        </div>
      );
    }

    if (currentRepositories.length === 0) {
      return (
        <div className="text-gray-400 text-center col-span-full py-12 animate-fade-in">
          <p className="mb-4">No Codes available yet.</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 inline-flex items-center space-x-2"
            disabled={refreshing}
          >
            <svg 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      );
    }

    return currentRepositories.map((repo, index) => (
      <div
        key={repo.title}
        className="p-4 sm:p-6 bg-gray-800/90 rounded-xl shadow-md border border-gray-700 hover:border-indigo-500 card-hover animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <h3 className="text-lg sm:text-xl font-medium text-white mb-2">{repo.title}</h3>
        <p className="text-gray-300 mt-1 line-clamp-2 text-sm sm:text-base">{repo.description || 'No description'}</p>
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <a
            href={repo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 text-center sm:text-left"
          >
            View Code
          </a>
          <button
            onClick={() => handleDelete(repo.title)}
            className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200 text-center sm:text-left"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <Header title="Owner" userData={userData} handleLogout={handleLogout} />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white animate-slide-in">Source Codes</h2>
          {!loading && repositories.length > 0 && (
            <button 
              onClick={handleRefresh}
              className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
              disabled={refreshing}
              aria-label="Refresh source codes"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {renderContent()}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8 animate-fade-in overflow-x-auto py-2">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 sm:px-3 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getPageNumbers().map((number, index) => (
                number === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-600 text-xs sm:text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-indigo-600 border-indigo-500 text-white'
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
                className="relative inline-flex items-center px-2 sm:px-3 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="sr-only">Next</span>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
        {!loading && !error && repositories.length > 0 && (
          <div className="text-center mt-2 text-xs sm:text-sm text-gray-400 animate-fade-in">
            Showing {indexOfFirstRepo + 1}-{Math.min(indexOfLastRepo, repositories.length)} of {repositories.length} source code
          </div>
        )}
      </div>

      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center z-40 transform hover:scale-110 animate-fade-in"
        aria-label="Add new code"
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {isModalOpen && (
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 ${
            isModalVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
        >
          <div 
            ref={modalRef}
            className={`bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-md transition-all duration-300 transform ${
              isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } animate-fade-in`}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Add Code</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">Source Link</label>
                <input
                  id="link"
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full p-2 sm:p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 text-sm sm:text-base"
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
                  placeholder="Source Title"
                  className="w-full p-2 sm:p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of the source"
                  className="w-full p-2 sm:p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20 sm:min-h-24 transition-colors duration-200 text-sm sm:text-base"
                />
              </div>
              <div className="flex justify-end space-x-3 sm:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  Add Code
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