import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoginButton from './components/LoginButton';
import Dashboard from './components/Dashboard';
import OwnerControls from './components/OwnerControls';
import Stars from './components/Stars';
import './styles.css';

function AuthCheck({ setIsAuthenticated, setUserData, isAuthenticated }) {
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://arona-backend.vercel.app/api/user', { withCredentials: true });
        setIsAuthenticated(true);
        setUserData(response.data);
      } catch (error) {
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
    const initialAuthCheck = async () => {
      try {
        const response = await axios.get('https://arona-backend.vercel.app/api/user', { withCredentials: true });
        setIsAuthenticated(true);
        setUserData(response.data);
      } catch (error) {
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
        <AuthCheck setIsAuthenticated={setIsAuthenticated} setUserData={setUserData} isAuthenticated={isAuthenticated} />
        
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;