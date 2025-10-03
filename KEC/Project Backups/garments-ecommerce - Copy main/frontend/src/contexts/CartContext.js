import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const updateQuantity = (itemId, newQuantity, selectedSize) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id && item.selectedSize === product.selectedSize);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      // Ensure price is properly formatted when adding to cart
      const cartProduct = {
        ...product,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        quantity: product.quantity || 1
      };
      return [...prev, cartProduct];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      updateQuantity 
    }}>
      {children}
    </CartContext.Provider>
  );
};
