import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FloatingBackButton from "../components/FloatingBackButton";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    landmark: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const navigate = useNavigate();

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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Phone validation (required for delivery and contact)
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Address validation (required for delivery)
    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip/Postal code is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          street: formData.address,
          address2: formData.address2 || undefined,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          landmark: formData.landmark || undefined
        }
      };

      const res = await axios.post("/api/auth/register", signupData);
      
      if (res.data.success) {
        showPopupMessage("🎉 Account created successfully! Welcome to G Fresh! Redirecting to login...", "success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Signup failed. Please try again.";
      // Focus the first error field if present
      if (err.response?.data?.message === 'User already exists with this email') {
        setErrors({ email: 'User already exists with this email' });
      }
      showPopupMessage(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <FloatingBackButton disabled={isLoading} />

      
      <div className="signup-container">
        <div className="signup-left">
          <div className="signup-content">
            <div className="signup-header">
              <div className="signup-logo">
                <img src="/logo.png" alt="G Fresh Logo" className="header-logo" />
              </div>
              <h1>Create Your Account</h1>
              <p>Join our community and start your shopping journey with G Fresh</p>
            </div>
            
            <form onSubmit={handleSignup} className="signup-form">
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "error" : ""}
                    required
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="signup-email">Email Address *</label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "signup-email-error" : undefined}
                    />
                    {errors.email && <span id="signup-email-error" className="error-message" role="alert">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                      required
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="form-section">
                <h3 className="section-title">Delivery Address</h3>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    name="address"
                    type="text"
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "error" : ""}
                    required
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
                <div className="form-group">
                  <label>Address Line 2 (Apartment, suite, etc.)</label>
                  <input
                    name="address2"
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={formData.address2}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      name="city"
                      type="text"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                      required
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label>State/Province/Region *</label>
                    <input
                      name="state"
                      type="text"
                      placeholder="Enter your state"
                      value={formData.state}
                      onChange={handleChange}
                      className={errors.state ? "error" : ""}
                      required
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Zip/Postal Code *</label>
                    <input
                      name="zipCode"
                      type="text"
                      placeholder="Enter your zip/postal code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={errors.zipCode ? "error" : ""}
                      required
                    />
                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      name="country"
                      type="text"
                      placeholder="Enter your country"
                      value={formData.country}
                      onChange={handleChange}
                      className={errors.country ? "error" : ""}
                      required
                    />
                    {errors.country && <span className="error-message">{errors.country}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Nearest Landmark (optional)</label>
                  <input
                    name="landmark"
                    type="text"
                    placeholder="e.g., Near City Mall"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="form-section">
                <h3 className="section-title">Security Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="signup-password">Password *</label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                      required
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "signup-password-error" : undefined}
                    />
                    {errors.password && <span id="signup-password-error" className="error-message" role="alert">{errors.password}</span>}
                    <div className="password-requirements">
                      <small>Password must be at least 6 characters long</small>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="signup-confirm-password">Confirm Password *</label>
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "error" : ""}
                      required
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "signup-confirm-password-error" : undefined}
                    />
                    {errors.confirmPassword && <span id="signup-confirm-password-error" className="error-message" role="alert">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>
              
              <div className="form-agreement">
                <label className="checkbox-wrapper">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="agreement-text">
                    I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className={`signup-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner">Creating Account...</span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            <div className="signup-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
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

export default Signup;
