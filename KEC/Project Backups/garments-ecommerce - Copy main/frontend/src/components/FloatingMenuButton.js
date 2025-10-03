import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";
import "./FloatingMenuButton.css";

const FloatingMenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { label: "Home", path: "/", show: true },
    { label: "Products", path: "/products", show: true },
    { label: `Cart ${cartItems.length > 0 ? `(${cartItems.length})` : ''}`, path: "/cart", show: true, badge: cartItems.length },
    { label: "About", path: "/about", show: true },
    { label: "Profile", path: "/profile", show: user },
    { label: "Admin Dashboard", path: "/admin/dashboard", show: user && user.role === 'admin' },
    { label: "Login", path: "/login", show: !user },
    { label: "Signup", path: "/signup", show: !user }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fab-backdrop" onClick={closeMenu}></div>}
      
      <div className={`floating-menu-container ${isOpen ? 'open' : ''}`}>
        {/* Menu Items */}
        <div className="fab-menu">
          {menuItems.filter(item => item.show).map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="fab-menu-item"
              onClick={closeMenu}
              style={{ 
                transitionDelay: `${index * 50}ms`,
                animationDelay: `${index * 50}ms`
              }}
            >
              <span className="fab-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="fab-badge">{item.badge}</span>
              )}
            </Link>
          ))}
          
          {/* Logout Button */}
          {user && (
            <button
              className="fab-menu-item fab-logout"
              onClick={handleLogout}
              style={{ 
                transitionDelay: `${menuItems.filter(item => item.show).length * 50}ms`,
                animationDelay: `${menuItems.filter(item => item.show).length * 50}ms`
              }}
            >
              <span className="fab-label">Logout</span>
            </button>
          )}
        </div>

        {/* Main FAB Button */}
        <button 
          className={`fab-main ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="fab-icon-main">
            {isOpen ? 'Close' : 'Menu'}
          </span>
        </button>

      </div>
    </>
  );
};

export default FloatingMenuButton;
