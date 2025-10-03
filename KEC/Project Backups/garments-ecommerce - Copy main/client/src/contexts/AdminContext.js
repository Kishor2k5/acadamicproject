import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("AdminContext: useEffect triggered, checking localStorage");
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    console.log("AdminContext: Found in localStorage - token:", adminToken ? "exists" : "none", "data:", adminData ? "exists" : "none");
    
    if (adminToken && adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        console.log("AdminContext: Parsed admin data:", parsedData);
        setAdmin(parsedData);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    } else {
      console.log("AdminContext: No admin data in localStorage");
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log("AdminContext: Starting admin login for:", email);

      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("AdminContext: API response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      if (data.success) {
        const adminData = data.data;
        console.log("AdminContext: Setting admin data:", adminData);
        setAdmin(adminData);
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        return { success: true, data: adminData };
      } else {
        throw new Error(data.message || 'Admin login failed');
      }
    } catch (error) {
      console.error("AdminContext: Login error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  };

  // Allow setting admin state when admin logs in through general user flow
  const setAdminFromUserLogin = (adminData) => {
    try {
      setAdmin(adminData);
      localStorage.setItem('adminToken', adminData.token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
    } catch (e) {
      console.error('AdminContext: setAdminFromUserLogin error:', e);
    }
  };

  const isAuthenticated = () => {
    const result = admin !== null;
    console.log("AdminContext: isAuthenticated called, admin=", admin, "result=", result);
    return result;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const value = {
    admin,
    loading,
    error,
    adminLogin,
    adminLogout,
    setAdminFromUserLogin,
    isAuthenticated,
    getAuthHeaders,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
