import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import FloatingBackButton from "../components/FloatingBackButton";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { setAdminFromUserLogin } = useAdmin();

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID
  const GOOGLE_REDIRECT_URI = window.location.origin + "/auth/google/callback";

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showPopupMessage = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 5000);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      // Initialize Google OAuth
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (response) => {
            if (response.access_token) {
              try {
                // Send token to your backend for verification
                const res = await axios.post("/api/auth/google", {
                  access_token: response.access_token
                });
                
                if (res.data.success) {
                  // Store user data and redirect
                  localStorage.setItem("token", res.data.data.token);
                  localStorage.setItem("user", JSON.stringify(res.data.data.user));
                  showPopupMessage("🎉 Google login successful! Welcome!", "success");
                  setTimeout(() => navigate("/products"), 2000);
                }
              } catch (error) {
                showPopupMessage("❌ Google login failed. Please try again.", "error");
              }
            }
            setGoogleLoading(false);
          },
        });
        
        client.requestAccessToken();
      } else {
        // Fallback for when Google script hasn't loaded
        showPopupMessage("⚠️ Google OAuth is loading. Please try again in a moment.", "error");
        setGoogleLoading(false);
      }
    } catch (error) {
      showPopupMessage("❌ Google login failed. Please try again.", "error");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await axios.post("/api/auth/login", { 
        email: formData.email, 
        password: formData.password 
      });
      
      // Check if the response has the expected structure
      if (res.data.success && res.data.data) {
        // Store token and user data
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify({
          id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role
        }));

        const isAdmin = res.data.data.role === 'admin';
        if (isAdmin) {
          // Populate AdminContext so ProtectedAdminRoute allows access
          try {
            setAdminFromUserLogin({
              _id: res.data.data._id,
              name: res.data.data.name,
              email: res.data.data.email,
              role: res.data.data.role,
              token: res.data.data.token
            });
          } catch (e) {
            console.error('Failed to set admin context from user login:', e);
          }
        }
        showPopupMessage(
          isAdmin
            ? "🎉 Login successful! Welcome back! Redirecting to admin dashboard..."
            : "🎉 Login successful! Welcome back! Redirecting to products...",
          "success"
        );
        setTimeout(() => {
          navigate(isAdmin ? "/admin/dashboard" : "/products");
        }, 2500);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Invalid email or password. Please try again.";
      // Focus the first error field if present
      if (err.response?.data?.message === 'Account is deactivated. Please contact support.') {
        setErrors({ email: '', password: '' });
      }
      showPopupMessage(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <FloatingBackButton disabled={isLoading} />
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        <div className="particle-container">
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        <div className="animated-logo">
          <img src="/logo.png" alt="G Fresh Logo" className="background-logo" />
        </div>
      </div>
      


      <div className="login-container">
        <div className="login-left">
          <div className="login-content">
            <div className="login-header">
              <div className="login-logo">
                <img src="/logo.png" alt="G Fresh Logo" className="header-logo" />
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue shopping</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address *</label>
                <div className="input-wrapper">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                  />
                </div>
                {errors.email && <span id="login-email-error" className="error-message" role="alert">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password *</label>
                <div className="input-wrapper">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    required
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && <span id="login-password-error" className="error-message" role="alert">{errors.password}</span>}
              </div>
              
              <div className="form-options">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              
              <button 
                type="submit" 
                className={`login-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner">Signing in...</span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            <div className="login-divider">
              <span>or</span>
            </div>
            
            <div className="social-login">
              <button 
                className={`social-btn google ${googleLoading ? 'loading' : ''}`}
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <span className="social-icon">
                  {googleLoading ? (
                    <div className="google-spinner"></div>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                </span>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </button>
              
              <button className="social-btn facebook">
                <span className="social-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </span>
                Continue with Facebook
              </button>
            </div>
            
            <div className="login-footer">
              <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-hero">
            <div className="hero-content">
              <h2>Welcome to G Fresh</h2>
              <p>Discover amazing products and great deals</p>
              <div className="login-features">
                <div className="feature">
                  <span className="feature-icon">🛍️</span>
                  <span>Shop Products</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🚚</span>
                  <span>Fast Delivery</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💳</span>
                  <span>Secure Payment</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎁</span>
                  <span>Great Deals</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🛡️</span>
                  <span>Safe Shopping</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📞</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Popup */}
      {showPopup && (
        <div className={`notification-popup ${popupType}`}>
          <div className="popup-content">
            <div className="popup-icon">
              {popupType === 'success' ? '✓' : '✕'}
            </div>
            <div className="popup-message">
              <h4>{popupType === 'success' ? 'Success!' : 'Error!'}</h4>
              <p>{popupMessage}</p>
            </div>
            <button 
              className="popup-close" 
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
