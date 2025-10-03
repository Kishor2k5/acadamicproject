import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AuthNavbar from "./AuthNavbar";

const ConditionalNavbar = () => {
  const location = useLocation();
  
  // Check if current path is login or signup
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  
  if (isAuthPage) {
    const pageType = location.pathname === "/login" ? "login" : "signup";
    return <AuthNavbar pageType={pageType} />;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar; 