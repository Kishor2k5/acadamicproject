import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPriceInRupeesSymbol, convertUSDToINR } from "../utils/currency";
import { CartContext } from "../contexts/CartContext";
import FloatingBackButton from "../components/FloatingBackButton";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  useEffect(() => {
    // Set loading to false after a short delay to show the cart
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const showPopupMessage = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleQuantityUpdate = (itemId, newQuantity, selectedSize) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity, selectedSize);
    showPopupMessage("Quantity updated");
  };

  const removeItem = (itemId) => {
    removeFromCart(itemId);
    showPopupMessage("Item removed from cart");
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Ensure price is a number and handle both price formats
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return total + (itemPrice * (item.quantity || 1));
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 1000 ? 0 : 40; // Free shipping above ₹1000, otherwise ₹40
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showPopupMessage("Your cart is empty", "error");
      return;
    }
    
    // Check if any items are out of stock
    const outOfStockItems = cartItems.filter(item => !item.inStock);
    if (outOfStockItems.length > 0) {
      showPopupMessage("Some items in your cart are out of stock. Please remove them before checkout.", "error");
      return;
    }
    
    // Navigate to checkout page with cart items
    navigate('/shop/checkout');
  };

  const continueShopping = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <FloatingBackButton disabled={loading} />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button className="continue-shopping-btn" onClick={continueShopping}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image_url || item.image} alt={item.name} />
                  </div>
                  
                  <div className="item-details">
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      {item.selectedSize && <p className="item-size">Size: {item.selectedSize}</p>}
                      {item.selectedColor && <p className="item-color">Color: {item.selectedColor}</p>}
                      <p className="item-price">{formatPriceInRupeesSymbol(item.price)}</p>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1, item.selectedSize)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1, item.selectedSize)}
                          >
                            +
                          </button>
                      </div>
                      
                      <div className="item-total">
                        <span className="total-amount">{formatPriceInRupeesSymbol(item.price * item.quantity)}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-header">
                <h2>Order Summary</h2>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPriceInRupeesSymbol(calculateSubtotal())}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'Free' : formatPriceInRupeesSymbol(calculateShipping())}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>{formatPriceInRupeesSymbol(calculateTax())}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPriceInRupeesSymbol(calculateTotal())}</span>
                </div>
              </div>
              
              <div className="summary-actions">
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={cartItems.filter(item => !item.inStock).length > 0}
                >
                  Proceed to Checkout
                </button>
                
                <button className="continue-shopping-btn-secondary" onClick={continueShopping}>
                  Continue Shopping
                </button>
              </div>
              
              <div className="cart-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🚚</span>
                  <div className="benefit-text">
                    <h4>Free Shipping</h4>
                    <p>On orders over $100</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <span className="benefit-icon">🔄</span>
                  <div className="benefit-text">
                    <h4>Easy Returns</h4>
                    <p>30-day return policy</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <span className="benefit-icon">🔒</span>
                  <div className="benefit-text">
                    <h4>Secure Checkout</h4>
                    <p>SSL encrypted payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className={`notification-popup ${popupType}`}>
          <div className="popup-content">
            <div className="popup-icon">
              {popupType === "success" ? "✓" : "✕"}
            </div>
            <div className="popup-message">{popupMessage}</div>
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

export default Cart;
