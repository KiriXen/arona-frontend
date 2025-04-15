import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AuthCallback({ setIsAuthenticated, setUserData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setError('No authentication token received');
      return;
    }

    try {
      const userData = jwtDecode(token);
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);
      setUserData(userData);

      if (userData.isOwner) {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Token decode error:', error);
      setError('Authentication failed');
      localStorage.removeItem('auth_token');
    }
  }, [location, navigate, setIsAuthenticated, setUserData]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-gray-800 rounded-xl shadow-xl text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-gray-800 rounded-xl shadow-xl text-center">
        <h1 className="text-xl font-bold text-white mb-4">Authenticating...</h1>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto animate-spin"></div>
      </div>
    </div>
  );
}

export default AuthCallback;