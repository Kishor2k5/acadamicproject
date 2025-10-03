import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Home</Link> |{" "}
    <Link to="/products">Products</Link> |{" "}
    <Link to="/cart">Cart</Link> |{" "}
    <Link to="/login">Login</Link> |{" "}
    <Link to="/signup">Signup</Link> |{" "}
    <Link to="/admin/login">Admin</Link>
  </nav>
);

export default Navbar;
