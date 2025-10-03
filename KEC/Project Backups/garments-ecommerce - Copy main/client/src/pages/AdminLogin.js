import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import FloatingBackButton from "../components/FloatingBackButton";
import "./AdminLogin.css";

const AdminLogin = () => {
  console.log("AdminLogin: Component rendered");
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated, loading: contextLoading } = useAdmin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => {
    // Go back if possible, else go home
    if (window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    console.log("AdminLogin: useEffect triggered, isAuthenticated=", isAuthenticated());
    // Redirect if already authenticated
    if (isAuthenticated()) {
      console.log("AdminLogin: Already authenticated, redirecting to dashboard");
      navigate("/admin/dashboard");
    } else {
      console.log("AdminLogin: Not authenticated, staying on login page");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminLogin: Form submitted with data:", formData);
    setLoading(true);
    setError("");

    try {
      console.log("Attempting admin login with:", formData);
      const result = await adminLogin(formData.email, formData.password);
      console.log("Login result:", result);
      
      if (result.success) {
        console.log("Login successful, navigating to dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Login failed:", result.error);
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    console.log("AdminLogin: Context still loading, showing loading screen");
    return (
      <div className="admin-login-page">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <FloatingBackButton disabled={loading || contextLoading} />
      <div className="admin-login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">👑</div>
              <h1>G Fresh Admin</h1>
              <p>Premium Garments Management</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <h4>Default Admin Credentials</h4>
            <div className="credential-item">
              <span className="credential-label">Email:</span>
              <span className="credential-value">admin@gmail.com</span>
            </div>
            <div className="credential-item">
              <span className="credential-label">Password:</span>
              <span className="credential-value">123456</span>
            </div>
            <p className="credential-note">
              Note: These are the default credentials. You can change them after first login.
            </p>
          </div>

          <div className="features-preview">
            <h4>Admin Features</h4>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Product Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Sales Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>Order Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <span>Reports & Graphs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
