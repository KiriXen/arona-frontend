import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoginButton from './pages/login';
import Dashboard from './pages/dashyboard';
import OwnerControls from './pages/owner';
import Stars from './components/star';
import AuthCallback from './components/callback';
import './styles.css';

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

function AuthCheck({ setIsAuthenticated, setUserData, isAuthenticated }) {
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsAuthenticated(false);
      setUserData(null);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/validate-token`);
        setIsAuthenticated(true);
        setUserData(response.data.user);
      } catch (error) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUserData(null);
      }
    };
    checkAuth();
  }, [location.pathname, setIsAuthenticated, setUserData, isAuthenticated]);

  return null;
}

function OwnerRoute({ isAuthenticated, userData }) {
  if (!isAuthenticated || !userData) {
    return <Navigate to="/" replace />;
  }
  if (!userData.isOwner) {
    return <Navigate to="/dashboard" replace />;
  }
  return <OwnerControls userData={userData} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const initialAuthCheck = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/validate-token`);
        setIsAuthenticated(true);
        setUserData(response.data.user);
      } catch (error) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUserData(null);
      }
    };
    initialAuthCheck();
  }, []);

  return (
    <Router>
      <div className="app">
        <Stars />
        <AuthCheck 
          setIsAuthenticated={setIsAuthenticated} 
          setUserData={setUserData} 
          isAuthenticated={isAuthenticated} 
        />
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated === false ? <LoginButton /> : isAuthenticated === true ? <Navigate to="/dashboard" replace /> : <div>Loading...</div>} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard userData={userData} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/owner" 
            element={<OwnerRoute isAuthenticated={isAuthenticated} userData={userData} />}
          />
          <Route 
            path="/auth-callback" 
            element={<AuthCallback setIsAuthenticated={setIsAuthenticated} setUserData={setUserData} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;