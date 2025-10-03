import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { formatPriceInRupeesSymbol } from "../utils/currency";
import { CartContext } from "../contexts/CartContext";
import PaymentForm from '../components/PaymentForm';
import "./Checkout.css";

// Initialize Stripe with error handling
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey && stripePublishableKey.startsWith('pk_') 
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useContext(CartContext);
  
  console.log('Checkout component rendered');
  console.log('Location state:', location.state);
  console.log('Cart items:', cartItems);
  
  // Get items from location state (for Buy Now) or from cart
  const checkoutItems = location.state?.buyNowItems || cartItems;
  const isBuyNow = location.state?.buyNowItems ? true : false;
  
  console.log('Checkout items:', checkoutItems);
  console.log('Is buy now:', isBuyNow);

  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    
    
    // Additional
    saveInfo: false,
    termsAccepted: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.data) {
          setUserProfile(response.data.data);
          // Pre-fill form with user data if available
          setFormData(prev => ({
            ...prev,
            firstName: response.data.data.name?.split(' ')[0] || '',
            lastName: response.data.data.name?.split(' ').slice(1).join(' ') || '',
            email: response.data.data.email || '',
            phone: response.data.data.phone || '',
            address: response.data.data.address || '',
            // You might want to parse address components if they're stored separately
            // city: response.data.data.city || '',
            // state: response.data.data.state || '',
            // zipCode: response.data.data.zipCode || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileError('Failed to load your profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateSubtotal = () => {
    return checkoutItems.reduce((total, item) => {
      // Ensure price is a number and handle both price formats
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return total + (itemPrice * (item.quantity || 1));
    }, 0);
  };

  const calculateShipping = () => {
    return 40; // Fixed shipping cost in INR
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => formData[field].trim() !== '');
  };

  const validatePaymentInfo = () => {
    // Payment validation is now handled by Stripe Elements
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateShippingInfo()) {
      alert('Please fill in all required shipping information');
      return;
    }
    if (currentStep === 2 && !validatePaymentInfo()) {
      alert('Please fill in all required payment information');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Create order after successful payment
      const orderData = {
        items: checkoutItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size,
          color: item.color,
          image: item.image_url
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentResult: paymentResult,
        totalAmount: calculateTotal(),
        subtotal: calculateSubtotal(),
        shippingCost: calculateShipping(),
        tax: calculateTax()
      };

      // TODO: Make API call to create order
      // const response = await axios.post('/api/orders', orderData);
      
      // Clear cart if it was a regular cart checkout
      if (!isBuyNow) {
        clearCart();
      }
      
      // Navigate to order confirmation
      navigate('/order-confirmation', {
        state: {
          orderNumber: `GF${Date.now()}`,
          items: checkoutItems,
          total: calculateTotal(),
          shippingAddress: {
            name: `${formData.firstName} ${formData.lastName}`,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          paymentResult
        }
      });
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Payment successful but there was an error creating your order. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  };

  const handlePlaceOrder = () => {
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    // Payment will be handled by PaymentForm component
    // This function is kept for terms validation
  };

  const renderShippingForm = () => (
    <div className="checkout-form-section">
      <h3>Shipping Information</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="saveInfo"
            checked={formData.saveInfo}
            onChange={handleInputChange}
          />
          Save this information for next time
        </label>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="checkout-form-section">
      <h3>Payment Information</h3>
      {stripePublishableKey && stripePublishableKey.startsWith('pk_') ? (
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={calculateTotal()}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            loading={loading}
            setLoading={setLoading}
          />
        </Elements>
      ) : (
        <div className="payment-setup-notice">
          <div className="notice-content">
            <h4>⚠️ Payment Setup Required</h4>
            <p>Payment processing is not configured. Please contact the administrator to set up Stripe payment integration.</p>
            <p>For testing purposes, you can continue with a mock payment.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Mock successful payment for testing
                handlePaymentSuccess({
                  id: 'mock_payment_' + Date.now(),
                  status: 'succeeded',
                  amount: calculateTotal() * 100,
                  currency: 'inr'
                });
              }}
            >
              Continue with Mock Payment (Testing)
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrderReview = () => (
    <div className="checkout-form-section">
      <h3>Order Review</h3>
      
      <div className="order-summary">
        <h4>Order Summary</h4>
        <div className="order-items">
          {checkoutItems.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-image">
                <img src={item.image_url} alt={item.name} />
              </div>
              <div className="item-details">
                <h5>{item.name}</h5>
                <p>Quantity: {item.quantity || 1}</p>
                <p className="item-price">{formatPriceInRupeesSymbol(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shipping-review">
        <h4>Shipping Address</h4>
        <div className="address-details">
          <p><strong>{formData.firstName} {formData.lastName}</strong></p>
          <p>{formData.address}</p>
          <p>{formData.city}, {formData.state} {formData.zipCode}</p>
          <p>{formData.country}</p>
          <p>Phone: {formData.phone}</p>
          <p>Email: {formData.email}</p>
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            required
          />
          I agree to the <a href="#" className="terms-link">Terms and Conditions</a> and <a href="#" className="terms-link">Privacy Policy</a>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Loading your information...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="checkout-error">
        <p>{profileError}</p>
        <p>You can continue with manual entry of your details.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            {currentStep === 1 && renderShippingForm()}
            {currentStep === 2 && renderPaymentForm()}
            {currentStep === 3 && renderOrderReview()}

            <div className="checkout-actions">
              {currentStep > 1 && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePrevStep}
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="btn btn-success" 
                  onClick={handlePlaceOrder}
                  disabled={loading || !formData.termsAccepted}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Subtotal ({checkoutItems.length} items)</span>
                <span>{formatPriceInRupeesSymbol(calculateSubtotal())}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>{formatPriceInRupeesSymbol(calculateShipping())}</span>
              </div>
              <div className="summary-item">
                <span>Tax (GST 18%)</span>
                <span>{formatPriceInRupeesSymbol(calculateTax())}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPriceInRupeesSymbol(calculateTotal())}</span>
              </div>
            </div>

            <div className="secure-checkout">
              <div className="secure-icon">🔒</div>
              <p>Secure Checkout</p>
              <small>Your payment information is encrypted and secure</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;