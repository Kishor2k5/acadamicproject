import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      closeMenu();
    }
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const canGoBack = () => {
    return window.history.length > 1 && location.pathname !== '/';
  };

  const handleGoBack = () => {
    if (canGoBack()) {
      navigate(-1);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="nav-brand">
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
              <img src="/logo.png" alt="G Fresh Logo" className="navbar-logo" />
              <span className="brand-text">G Fresh</span>
            </Link>
          </div>
          
          {/* Quick Access Icons */}
          <div className="nav-quick-access">
            {canGoBack() && (
              <button 
                onClick={handleGoBack} 
                className="quick-icon back-btn" 
                title="Go Back"
              >
                Back
              </button>
            )}
            <Link to="/products" className="quick-icon" title="Products">
              Products
            </Link>
            <Link to="/cart" className="quick-icon cart-icon" title="Cart">
              Cart
              {totalCartItems > 0 && (
                <span className="cart-badge">{totalCartItems}</span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" className="quick-icon" title="Profile">
                Profile
              </Link>
            ) : (
              <>
                <Link to="/login" className="quick-icon" title="Login">
                  Login
                </Link>
                <Link to="/signup" className="quick-icon" title="Sign Up">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Menu Button */}
          <button 
            className={`menu-button ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Menu Overlay */}
      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}>
        <div className="menu-content" onClick={(e) => e.stopPropagation()}>
          <div className="menu-header">
            <h2>Menu</h2>
            <button className="close-menu" onClick={closeMenu}>
              Close
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="menu-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {/* User Info */}
          {user && (
            <div className="menu-user-info">
              <span>Welcome, {user.name || user.email}!</span>
            </div>
          )}

          <div className="menu-items">
            <Link className="menu-item" to="/" onClick={closeMenu}>
              Home
            </Link>
            <Link className="menu-item" to="/products" onClick={closeMenu}>
              Products
            </Link>
            <Link className="menu-item" to="/cart" onClick={closeMenu}>
              Cart
              {totalCartItems > 0 && (
                <span className="cart-badge">{totalCartItems}</span>
              )}
            </Link>
            <Link className="menu-item" to="/about" onClick={closeMenu}>
              About Us
            </Link>
            
            <div className="menu-divider"></div>
            
            {user ? (
              <>
                <Link className="menu-item" to="/profile" onClick={closeMenu}>
                  My Profile
                </Link>
                <Link className="menu-item" to="/orders" onClick={closeMenu}>
                  My Orders
                </Link>
                <Link className="menu-item" to="/track" onClick={closeMenu}>
                  Track Order
                </Link>
                {user.role === 'admin' && (
                  <>
                    <div className="menu-divider"></div>
                    <Link className="menu-item" to="/admin/dashboard" onClick={closeMenu}>
                      Admin Dashboard
                    </Link>
                    <Link className="menu-item" to="/admin/inventory" onClick={closeMenu}>
                      Inventory
                    </Link>
                  </>
                )}
                <div className="menu-divider"></div>
                <button className="menu-item logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="menu-item" to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link className="menu-item" to="/signup" onClick={closeMenu}>
                  Sign Up
                </Link>
                <div className="menu-divider"></div>
                <div className="menu-item" style={{opacity: 0.7, cursor: 'default'}}>
                  Please login to access more features
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
