import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { formatPriceInRupeesSymbol } from "../utils/currency";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state
  const orderDetails = location.state;
  
  if (!orderDetails) {
    // Redirect to home if no order details
    navigate('/');
    return null;
  }

  const { orderNumber, items, total, shippingAddress } = orderDetails;

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="success-animation">
          <div className="checkmark">Success</div>
        </div>
        
        <div className="confirmation-header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="order-details-card">
          <div className="order-number">
            <h2>Order #{orderNumber}</h2>
            <p className="order-date">Order Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity || 1}</p>
                    <p className="item-price">{formatPriceInRupeesSymbol(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatPriceInRupeesSymbol(items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{formatPriceInRupeesSymbol(5.99)}</span>
              </div>
              <div className="total-row">
                <span>Tax (GST 18%):</span>
                <span>{formatPriceInRupeesSymbol(items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) * 0.18)}</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>{formatPriceInRupeesSymbol(total)}</span>
              </div>
            </div>
          </div>

          <div className="shipping-details">
            <h3>Shipping Address</h3>
            <div className="address-info">
              <p><strong>{shippingAddress.name}</strong></p>
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>

          <div className="delivery-info">
            <h3>Delivery Information</h3>
            <div className="delivery-details">
              <div className="delivery-item">
                <div className="delivery-icon">Package</div>
                <div className="delivery-text">
                  <h4>Estimated Delivery</h4>
                  <p>3-5 business days</p>
                </div>
              </div>
              <div className="delivery-item">
                <div className="delivery-icon">Email</div>
                <div className="delivery-text">
                  <h4>Confirmation Email</h4>
                  <p>Sent to your email address</p>
                </div>
              </div>
              <div className="delivery-item">
                <div className="delivery-icon">Mobile</div>
                <div className="delivery-text">
                  <h4>Order Tracking</h4>
                  <p>You'll receive tracking details soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you have any questions about your order, please contact our customer support:</p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">Email</span>
              <span>support@garmentsstore.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">Phone</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">Chat</span>
              <span>Live Chat Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;



