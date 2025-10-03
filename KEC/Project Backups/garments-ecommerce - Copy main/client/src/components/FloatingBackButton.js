import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FloatingBackButton.css';

const FloatingBackButton = ({ disabled = false, customClass = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`floating-back-btn ${customClass}`}
      aria-label="Go back"
      disabled={disabled}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>Back</span>
    </button>
  );
};

export default FloatingBackButton;
