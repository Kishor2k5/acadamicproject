import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
// ...other imports

const Products = () => {
  // ...existing code
  const { addToCart } = useContext(CartContext);

  // In your product map:
  <button onClick={() => addToCart(product)}>Add to Cart</button>
  // ...
};