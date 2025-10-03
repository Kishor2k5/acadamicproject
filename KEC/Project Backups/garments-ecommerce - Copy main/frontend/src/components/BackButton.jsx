import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BackButton.css";

const HIDE_ON_PATHS = new Set(["/", "/about"]);

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on selected paths
  if (HIDE_ON_PATHS.has(location.pathname)) return null;

  const canGoBack = window.history.length > 1;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    } else {
      // Fallback route if no history
      navigate("/products");
    }
  };

  return (
    <button
      type="button"
      aria-label="Go back"
      className="back-btn"
      onClick={handleBack}
    >
      <span className="back-icon" aria-hidden>Back</span>
    </button>
  );
};

export default BackButton;
