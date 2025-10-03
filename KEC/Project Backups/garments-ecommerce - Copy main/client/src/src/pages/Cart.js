import React from "react";
// You would fetch cart items from context or backend

const Cart = () => {
  // Dummy cart for example
  const cart = [
    { id: 1, name: "Shirt", price: 20, quantity: 2 }
  ];

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity} = ${item.price * item.quantity}
        </div>
      ))}
      <hr />
      <b>Total: ${total}</b>
      <br />
      <a href="/checkout"><button>Checkout</button></a>
    </div>
  );
};

export default Cart;
