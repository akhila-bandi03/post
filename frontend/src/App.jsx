import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import './index.css';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Guard (redirects to /feed if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/feed" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        {/* Default route */}
        <Route path="/" element={<Navigate to="/feed" replace />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
