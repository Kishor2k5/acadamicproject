import React from "react";
import { Link } from "react-router-dom";

const AuthNavbar = ({ pageType }) => {
  return (
    <nav className="auth-navbar">
      <div className="auth-navbar-container">
        <div className="auth-navbar-left">
          <Link className="auth-navbar-brand" to="/">
            Garments Store
          </Link>
        </div>
        <div className="auth-navbar-right">
          {pageType === 'login' ? (
            <Link className="auth-navbar-link" to="/signup">
              Create Account
            </Link>
          ) : (
            <Link className="auth-navbar-link" to="/login">
              Sign In
            </Link>
          )}
          <Link className="auth-navbar-link" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar; 