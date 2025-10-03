import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/FloatingBackButton.css";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackButton from "./components/BackButton";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Profile from "./pages/Profile";
import OrderTracking from "./pages/OrderTracking";
import InventoryManagement from "./pages/InventoryManagement";
import AddProduct from "./pages/AddProduct";
import "./App.css";

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <div style={{paddingTop: '70px'}}>
              <Routes>
            <Route path="/" element={<About />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/track/:orderNumber" element={<OrderTracking />} />
            <Route 
              path="/admin/add-product" 
              element={
                <ProtectedAdminRoute>
                  <AddProduct />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/inventory" 
              element={
                <ProtectedAdminRoute>
                  <InventoryManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={<Navigate to="/admin/dashboard/overview" replace />}
            />
            <Route 
              path="/admin/dashboard/:tab" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
              </Routes>
            </div>
            <Footer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;
