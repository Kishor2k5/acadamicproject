// Currency utility functions for Indian Rupees

// Convert USD to INR (approximate rate: 1 USD = 83 INR)
const USD_TO_INR_RATE = 83;

// Format price in Indian Rupees
export const formatPriceInRupees = (priceInUSD) => {
  const priceInINR = priceInUSD * USD_TO_INR_RATE;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInINR);
};

// Format price in Indian Rupees with symbol only (no conversion)
export const formatPriceInRupeesSymbol = (priceInINR) => {
  return `₹${Math.round(priceInINR).toLocaleString('en-IN')}`;
};

// Format price in Indian Rupees without symbol
export const formatPriceInRupeesNumber = (priceInUSD) => {
  const priceInINR = priceInUSD * USD_TO_INR_RATE;
  return Math.round(priceInINR).toLocaleString('en-IN');
};

// Convert USD to INR
export const convertUSDToINR = (usdAmount) => {
  return usdAmount * USD_TO_INR_RATE;
}; 