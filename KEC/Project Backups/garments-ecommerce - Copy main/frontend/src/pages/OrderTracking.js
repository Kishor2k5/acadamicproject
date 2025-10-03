import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      fetchTrackingData(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchTrackingData = async (orderNum) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/tracking/order/${orderNum}`);
      
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
      setError(error.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderNumber.trim()) {
      navigate(`/track/${searchOrderNumber.trim()}`);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔧',
      packed: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      refunded: '💰'
    };
    return icons[status] || '❓';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#6f42c1',
      packed: '#17a2b8',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545',
      refunded: '#fd7e14'
    };
    return colors[status] || '#6c757d';
  };

  const getProgressPercentage = (status) => {
    const statusOrder = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="order-tracking">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading tracking information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <div className="container">
        <div className="tracking-header">
          <h1>Order Tracking</h1>
          <p>Track your order status and delivery information</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="tracking-search">
            <input
              type="text"
              placeholder="Enter your order number (e.g., GF24010112345)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Track Order
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <h3>Order Not Found</h3>
              <p>{error}</p>
              <p>Please check your order number and try again.</p>
            </div>
          </div>
        )}

        {trackingData && (
          <div className="tracking-content">
            <div className="order-summary">
              <div className="order-header">
                <h2>Order #{trackingData.orderNumber}</h2>
                <div className="order-meta">
                  <span>Placed on {new Date(trackingData.createdAt).toLocaleDateString()}</span>
                  <span className="total-amount">Total: ₹{trackingData.totalAmount}</span>
                </div>
              </div>

              <div className="status-overview">
                <div className="current-status">
                  <span className="status-icon">{getStatusIcon(trackingData.status)}</span>
                  <div className="status-info">
                    <h3 style={{ color: getStatusColor(trackingData.status) }}>
                      {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
                    </h3>
                    <p>Payment Status: {trackingData.paymentStatus}</p>
                  </div>
                </div>

                {trackingData.trackingNumber && (
                  <div className="tracking-number">
                    <strong>Tracking Number:</strong> {trackingData.trackingNumber}
                  </div>
                )}

                {trackingData.estimatedDelivery && (
                  <div className="estimated-delivery">
                    <strong>Estimated Delivery:</strong> {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${getProgressPercentage(trackingData.status)}%`,
                    backgroundColor: getStatusColor(trackingData.status)
                  }}
                ></div>
              </div>
            </div>

            <div className="tracking-timeline">
              <h3>Order Timeline</h3>
              <div className="timeline">
                {trackingData.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker" style={{ backgroundColor: getStatusColor(history.status) }}>
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{history.status.charAt(0).toUpperCase() + history.status.slice(1)}</h4>
                        <span className="timeline-date">
                          {new Date(history.date).toLocaleString()}
                        </span>
                      </div>
                      {history.note && <p className="timeline-note">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-details">
              <div className="items-section">
                <h3>Items Ordered</h3>
                <div className="items-list">
                  {trackingData.items.map((item, index) => (
                    <div key={index} className="item-card">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="item-image" />
                      )}
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <div className="item-details">
                          <span>Size: {item.size}</span>
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Qty: {item.quantity}</span>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shipping-section">
                <h3>Shipping Address</h3>
                <div className="address-card">
                  <p><strong>{trackingData.shippingAddress.firstName} {trackingData.shippingAddress.lastName}</strong></p>
                  <p>{trackingData.shippingAddress.address}</p>
                  <p>{trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} {trackingData.shippingAddress.zipCode}</p>
                  <p>{trackingData.shippingAddress.country}</p>
                  {trackingData.shippingAddress.phone && (
                    <p>Phone: {trackingData.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="help-section">
              <h3>Need Help?</h3>
              <p>If you have any questions about your order, please contact our customer support.</p>
              <div className="help-actions">
                <button className="help-button">Contact Support</button>
                <button className="help-button secondary" onClick={() => navigate('/profile')}>
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
