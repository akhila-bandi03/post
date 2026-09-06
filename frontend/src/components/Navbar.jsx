import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📡</span>
          <span className="logo-title">FeedConnect</span>
        </Link>

        <div className="navbar-actions">
          {username ? (
            <>
              <div className="navbar-user-chip">
                <span className="user-avatar-small">
                  {username.charAt(0).toUpperCase()}
                </span>
                <span className="navbar-username">@{username}</span>
              </div>
              <button
                id="logout-button"
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn-secondary-link">
                Login
              </Link>
              <Link to="/signup" className="btn-primary-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
