import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './PaymentForm.css';

const PaymentForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/payment/create-intent', {
          amount,
          orderId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setClientSecret(response.data.data.clientSecret);
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setPaymentError('Failed to initialize payment');
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const card = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
        }
      });

      if (error) {
        setPaymentError(error.message);
        onPaymentError(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const token = localStorage.getItem('token');
        await axios.post('/api/payment/confirm', {
          paymentIntentId: paymentIntent.id,
          orderId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="payment-form">
      <h3>Payment Information</h3>
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
        
        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}

        <div className="payment-summary">
          <div className="total-amount">
            <strong>Total: ₹{amount.toFixed(2)}</strong>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || !clientSecret}
          className={`payment-button ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
        </button>
      </form>

      <div className="payment-security">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
};

export default PaymentForm;
