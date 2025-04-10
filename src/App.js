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
      console.log('AuthCheck - Skipping, already authenticated');
      return;
    }
    console.log('AuthCheck - Running for path:', location.pathname);
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user', { withCredentials: true });
        console.log('AuthCheck - User authenticated:', JSON.stringify(response.data, null, 2));
        setIsAuthenticated(true);
        setUserData(response.data);
      } catch (error) {
        console.log('AuthCheck - Authentication check failed:', error.message);
        setIsAuthenticated(false);
        setUserData(null);
      }
    };
    checkAuth();
  }, [location.pathname, setIsAuthenticated, setUserData, isAuthenticated]);

  return null;
}

function OwnerRoute({ isAuthenticated, userData }) {
  console.log('OwnerRoute - Evaluating:', { isAuthenticated, userData: JSON.stringify(userData, null, 2) });
  if (!isAuthenticated || !userData) {
    console.log('OwnerRoute - Redirecting to /');
    return <Navigate to="/" replace />;
  }
  if (!userData.isOwner) {
    console.log('OwnerRoute - Redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  console.log('OwnerRoute - Rendering OwnerControls');
  return <OwnerControls userData={userData} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log('App - Running initial auth check');
    const initialAuthCheck = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user', { withCredentials: true });
        console.log('App - Initial auth check succeeded:', JSON.stringify(response.data, null, 2));
        setIsAuthenticated(true);
        setUserData(response.data);
      } catch (error) {
        console.log('App - Initial auth check failed:', error.message);
        setIsAuthenticated(false);
        setUserData(null);
      }
    };
    initialAuthCheck();
  }, []);

  console.log('App - Rendering with:', { isAuthenticated, userData: JSON.stringify(userData, null, 2) });

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