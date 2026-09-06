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
    <header className="tp-navbar">
      <div className="tp-navbar-inner">
        {/* Left: App Title / Logo */}
        <div className="tp-brand-group">
          <h1 className="tp-social-title">Social</h1>
        </div>

        {/* Right: TaskPlanet Stats & Profile */}
        <div className="tp-header-right">
          <div className="tp-stat-pill tp-star-pill" title="Reward Points">
            <span className="tp-pill-num">50</span>
            <span className="tp-pill-icon">⭐</span>
          </div>

          <div className="tp-stat-pill tp-wallet-pill" title="Wallet Balance">
            <span className="tp-wallet-text">₹0.00</span>
          </div>

          <button className="tp-theme-toggle" title="Toggle Theme">
            <span>🌙</span>
          </button>

          {username ? (
            <div className="tp-profile-group">
              <div className="tp-avatar-ring" title={`Logged in as @${username}`}>
                <div className="tp-avatar-inner">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                id="logout-button"
                className="tp-btn-logout"
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="tp-auth-btns">
              <Link to="/login" className="tp-btn-auth-sec">
                Login
              </Link>
              <Link to="/signup" className="tp-btn-auth-pri">
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
