import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import ProductForm from "../components/ProductForm";
import { adminListOrders, adminUpdateOrderStatus, adminGetLabelData, adminSalesReport, adminAnalytics } from "../api/orders";
import { getProducts } from "../api/products";
import { adminCreateProduct, adminDeleteProduct } from "../api/productsAdmin";
import { Line, Bar } from "react-chartjs-2";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./AdminDashboard.css";

// Utility: currency formatting (₹, en-IN)
const formatCurrency = (num) => `₹${(Number(num) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Inline SVG icons for consistent, accessible UI (replaces emojis)
const Icon = {
  Money: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Box: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M21 7l-9-4-9 4 9 4 9-4z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 11v10" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Users: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M2 21a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 21h6a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Chart: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 19V5" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="11" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="7" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="14" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Clock: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Wrench: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M21 3l-6.5 6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M17 3a4 4 0 0 0-5 5L3 17l4 4 9-9a4 4 0 0 0 5-5z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Truck: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 7h11v8H3z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 11h5l2 3v1h-7" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Check: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Cross: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Tag: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M20 13l-7 7-10-10V3h7l10 10z" stroke="currentColor" strokeWidth="2" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  Scroll: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 4h11a2 2 0 012 2v10a2 2 0 01-2 2H7a3 3 0 01-3-3V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Edit: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Trash: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Plus: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Gear: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a7.96 7.96 0 00.1-2l2-1-2-4-2 1a8.03 8.03 0 00-1.7-1l-.3-2h-4l-.3 2a8.03 8.03 0 00-1.7 1l-2-1-2 4 2 1a7.96 7.96 0 00.1 2l-2 1 2 4 2-1c.5.4 1.1.7 1.7 1l.3 2h4l.3-2c.6-.3 1.2-.6 1.7-1l2 1 2-4-2-1z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Door: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="6" y="3" width="12" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <circle cx="9.5" cy="12" r="1" fill="currentColor" />
    </svg>
  )
};

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 29.99,
    stock: 150,
    category: "shirts",
    status: "active",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Classic Denim Jeans",
    price: 79.99,
    stock: 85,
    category: "pants",
    status: "active",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Casual Hoodie",
    price: 59.99,
    stock: 200,
    category: "hoodies",
    status: "active",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"
  }
];

const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    items: 3,
    total: 169.97,
    status: "pending",
    date: "2024-01-15",
    address: "123 Main St, City, State 12345"
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    items: 2,
    total: 139.98,
    status: "shipped",
    date: "2024-01-14",
    address: "456 Oak Ave, City, State 12345"
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    items: 1,
    total: 79.99,
    status: "delivered",
    date: "2024-01-13",
    address: "789 Pine Rd, City, State 12345"
  }
];

const mockSalesData = {
  daily: [1200, 1800, 1500, 2200, 1900, 2500, 2100],
  weekly: [8500, 9200, 7800, 10500, 9800, 11200, 8900],
  monthly: [45000, 52000, 48000, 61000, 55000, 68000, 59000]
};

const AdminDashboardContent = () => {
  console.log("AdminDashboard: Component rendered");
  const navigate = useNavigate();
  const { tab } = useParams();
  const { admin, adminLogout } = useAdmin();
  const validTabs = ["overview","users","orders","products","reports","analytics","settings"];
  const initialTab = validTabs.includes(tab) ? tab : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // keep state in sync when URL changes
  useEffect(() => {
    if (!tab) return;
    if (!validTabs.includes(tab)) {
      navigate('/admin/dashboard/overview', { replace: true });
      return;
    }
    setActiveTab(tab);
  }, [tab]);
  // Users management state (placeholder until wired to backend)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [editUserModal, setEditUserModal] = useState({ open: false, user: null, form: { name: '', email: '', phone: '', role: 'user' } });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");
  const [labelModal, setLabelModal] = useState({ open: false, data: null });
  const [historyModal, setHistoryModal] = useState({ open: false, loading: false, orderNumber: '', history: [], error: '' });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "shirts",
    imageUrl: "",
    description: "",
  });
  const [newProductFiles, setNewProductFiles] = useState([]);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsData, setAnalyticsData] = useState({ timeseries: [], byCategory: [] });
  
  // Reports state
  const [reportData, setReportData] = useState({ labels: [], orders: [], revenue: [] });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportFilters, setReportFilters] = useState({ interval: 'day', from: '', to: '' });

  const fetchReport = async (filters) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setReportLoading(true);
    setReportError("");
    try {
      const params = { interval: filters.interval };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await adminSalesReport(params, token);
      const rows = res?.data?.data || [];
      setReportData({
        labels: rows.map(r => r._id),
        orders: rows.map(r => r.orders),
        revenue: rows.map(r => r.revenue),
      });
    } catch (err) {
      setReportError(err?.response?.data?.message || err.message || 'Failed to load report');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    console.log("AdminDashboard: useEffect triggered, admin=", admin);
    if (!admin) {
      console.log("AdminDashboard: No admin, redirecting to login");
      navigate("/");
      return;
    }
    // keep URL in sync if missing
    if (!tab) {
      navigate(`/admin/dashboard/${activeTab}`, { replace: true });
    }
    // fetch orders
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    setOrdersLoading(true);
    setOrdersError("");
    adminListOrders({}, token)
      .then((res) => {
        const list = res?.data?.data || [];
        setOrders(list.map(o => ({
          id: o._id,
          orderNumber: o.orderNumber,
          customer: `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.trim(),
          items: o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0,
          total: o.totalAmount,
          status: o.status,
          date: new Date(o.createdAt).toISOString().slice(0,10),
        })));
      })
      .catch((err) => {
        console.error("AdminDashboard: fetch orders error", err);
        setOrdersError(err?.response?.data?.message || err.message || "Failed to load orders");
      })
      .finally(() => setOrdersLoading(false));
    // fetch products (public list is fine for now)
    setProductsLoading(true);
    setProductsError("");
    getProducts()
      .then((res) => {
        const list = res?.data?.data || [];
        setProducts(list.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category,
          image: p.images?.[0] || "",
        })));
      })
      .catch((err) => setProductsError(err?.response?.data?.message || err.message || 'Failed to load products'))
      .finally(() => setProductsLoading(false));
  }, [admin, navigate]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/users?page=1&limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.data || [];
      setUsers(list.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.isActive,
      })));
    } catch (e) {
      setUsersError(e?.response?.data?.message || e.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const openOrderHistory = async (orderId) => {
    try {
      setHistoryModal({ open: true, loading: true, orderNumber: '', history: [], error: '' });
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`/api/orders/${orderId}/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res?.data?.data || {};
      setHistoryModal({ open: true, loading: false, orderNumber: data.orderNumber || '', history: data.history || [], error: '' });
    } catch (e) {
      setHistoryModal(prev => ({ ...prev, loading: false, error: e?.response?.data?.message || e.message || 'Failed to load history' }));
    }
  };

  const closeHistoryModal = () => setHistoryModal({ open: false, loading: false, orderNumber: '', history: [], error: '' });

  // Load users when Users tab is opened
  useEffect(() => {
    if (activeTab !== 'users') return;
    fetchUsers();
  }, [activeTab]);

  // Load analytics with auto-refresh when Analytics tab active
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    let timer;
    const token = localStorage.getItem('adminToken');
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError("");
        const res = await adminAnalytics({ interval: 'day' }, token);
        const data = res?.data?.data || { timeseries: [], byCategory: [] };
        setAnalyticsData({
          timeseries: data.timeseries || [],
          byCategory: data.byCategory || []
        });
      } catch (e) {
        setAnalyticsError(e?.response?.data?.message || e.message || 'Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    timer = setInterval(fetchAnalytics, 15000); // refresh every 15s
    return () => timer && clearInterval(timer);
  }, [activeTab]);

  // Load reports when Reports tab is opened
  useEffect(() => {
    if (activeTab !== 'reports') return;
    fetchReport(reportFilters);
  }, [activeTab, reportFilters.interval, reportFilters.from, reportFilters.to]);

  const handleToggleUserActive = async (user) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`/api/users/${user.id}/active`, { isActive: !user.active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  const openEditUser = (u) => {
    setEditUserModal({ open: true, user: u, form: { name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || 'user' } });
  };

  const closeEditUser = () => setEditUserModal({ open: false, user: null, form: { name: '', email: '', phone: '', role: 'user' } });

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const { user, form } = editUserModal;
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/users/${user.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(x => x.id === user.id ? { ...x, ...form } : x));
      closeEditUser();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  const renderUsers = () => (
    <div className="users-section">
      <h2>Users</h2>
      {usersLoading && <p>Loading users...</p>}
      {usersError && <p style={{color:'red'}}>{usersError}</p>}
      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

      {editUserModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={closeEditUser}>✕</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSaveUser} className="add-product-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={editUserModal.form.name} onChange={e=>setEditUserModal(prev=>({ ...prev, form: { ...prev.form, name: e.target.value } }))} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={editUserModal.form.email} onChange={e=>setEditUserModal(prev=>({ ...prev, form: { ...prev.form, email: e.target.value } }))} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={editUserModal.form.phone} onChange={e=>setEditUserModal(prev=>({ ...prev, form: { ...prev.form, phone: e.target.value } }))} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={editUserModal.form.role} onChange={e=>setEditUserModal(prev=>({ ...prev, form: { ...prev.form, role: e.target.value } }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="close-btn" onClick={closeEditUser}>Cancel</button>
                  <button type="submit" className="add-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {historyModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Order History {historyModal.orderNumber && `- ${historyModal.orderNumber}`}</h3>
              <button className="close-btn" onClick={closeHistoryModal}>✕</button>
            </div>
            <div className="modal-content">
              {historyModal.loading && <p>Loading...</p>}
              {historyModal.error && <p style={{color:'red'}}>{historyModal.error}</p>}
              {!historyModal.loading && !historyModal.error && (
                <div className="history-list">
                  {historyModal.history.length === 0 && <p>No history yet.</p>}
                  {historyModal.history.map((h, idx) => (
                    <div key={idx} className="history-item" style={{display:'flex', gap:12, alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(h.status) }}>
                        {getStatusIcon(h.status)} {h.status}
                      </span>
                      <span style={{opacity:0.9}}>{new Date(h.changedAt).toLocaleString()}</span>
                      {h.changedBy && <span style={{opacity:0.9}}>by {h.changedBy.name || h.changedBy.email}</span>}
                      {h.note && <span style={{opacity:0.9}}>— {h.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-actions">
              <button onClick={closeHistoryModal}>Close</button>
            </div>
          </div>
        </div>
      )}
        {users.length === 0 && !usersLoading && !usersError && (
          <div className="table-row" style={{padding:20}}>
            <div className="table-cell" style={{opacity:0.9}}>No users found.</div>
          </div>
        )}
        {users.map(u => (
          <div key={u.id} className="table-row">
            <div className="table-cell" data-label="Name">{u.name}</div>
            <div className="table-cell" data-label="Email">{u.email}</div>
            <div className="table-cell" data-label="Role">{u.role}</div>
            <div className="table-cell" data-label="Status">
              <span className="status-badge" style={{ backgroundColor: u.active ? '#10b981' : '#6b7280' }}>
                {u.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="table-cell" data-label="Actions">
              <button className="edit-btn" onClick={() => openEditUser(u)}>
                <Icon.Edit style={{marginRight:6}} /> Edit
              </button>
              <button className="delete-btn" onClick={() => handleToggleUserActive(u)}>
                {u.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p style={{marginTop:12, color:'rgba(255,255,255,0.8)'}}>
        Note: Name/Email/Phone/Role can be edited via the Edit button.
      </p>
    </div>
  );

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setCreatingProduct(true);
      // Basic validation
      const priceNum = Number(newProduct.price);
      const stockNum = Number(newProduct.stock);
      if (!newProduct.name.trim()) throw new Error('Product name is required');
      if (isNaN(priceNum) || priceNum < 0) throw new Error('Price must be a non-negative number');
      if (!Number.isInteger(stockNum) || stockNum < 0) throw new Error('Stock must be a non-negative integer');
      const token = localStorage.getItem("adminToken");
      const form = new FormData();
      form.append('name', newProduct.name);
      form.append('price', newProduct.price);
      form.append('stock', newProduct.stock);
      form.append('category', newProduct.category);
      if (newProduct.description) form.append('description', newProduct.description);
      if (newProductFiles.length > 0) {
        newProductFiles.forEach(file => {
          form.append('images', file);
        });
      } else if (newProduct.imageUrl) {
        // fallback: if URL provided, we can't upload via server; ignore or consider server-side fetch in future
      }
      await adminCreateProduct(form, token);
      // refresh product list
      const res = await getProducts();
      const list = res?.data?.data || [];
      setProducts(list.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        image: p.images?.[0] || "",
      })));
      setNewProduct({ name: "", price: "", stock: "", category: "shirts", imageUrl: "", description: "" });
      setNewProductFiles([]);
      setPreviewUrls([]);
      setShowAddProduct(false);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem("adminToken");
      await adminDeleteProduct(id, token);
      setProducts(products.filter(p => p.id !== id));
      showPopup('Product deleted successfully', 'success');
    } catch (err) {
      showPopup(err?.response?.data?.message || err.message || 'Failed to delete product', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (formData) => {
    if (!editingProduct) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `/api/admin/products/${editingProduct.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );

      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...response.data, image: response.data.image || p.image } : p
      ));
      
      setIsEditModalOpen(false);
      setEditingProduct(null);
      showPopup('Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showPopup(error.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ ...popup, show: false });
    }, 3000);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await adminUpdateOrderStatus(orderId, { status: newStatus }, token);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to update status');
    }
  };

  const openPrintLabel = async (orderId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await adminGetLabelData(orderId, token);
      const data = res?.data?.data;
      setLabelModal({ open: true, data });
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to load label');
    }
  };

  const closeLabelModal = () => setLabelModal({ open: false, data: null });

  const printLabelNow = () => {
    if (!labelModal.data) return;
    const d = labelModal.data;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(JSON.stringify(d.qrPayload))}`;
    const w = window.open('', 'PRINT', 'height=650,width=480,top=100,left=150');
    w.document.write(`<!doctype html><html><head><title>Label ${d.orderNumber}</title>
      <style>body{font-family:Arial;padding:16px} .row{margin-bottom:8px} .totals div{margin:2px 0} .addr{white-space:pre-line}</style>
      </head><body>`);
    w.document.write(`<h3>Order ${d.orderNumber}</h3>`);
    w.document.write(`<div class="row"><strong>Ship To:</strong><div class="addr">${d.shippingAddress.firstName} ${d.shippingAddress.lastName}\n${d.shippingAddress.address}\n${d.shippingAddress.city}, ${d.shippingAddress.state} ${d.shippingAddress.zipCode}\n${d.shippingAddress.country}\n${d.shippingAddress.phone}</div></div>`);
    w.document.write(`<div class="row"><strong>Items:</strong><div>${d.items.map(it => `${it.name} x${it.quantity}`).join('<br/>')}</div></div>`);
    w.document.write(`<div class="row totals"><div>Subtotal: ₹${d.totals.subtotal}</div><div>Shipping: ₹${d.totals.shipping}</div><div>Tax: ₹${d.totals.tax}</div><div><strong>Total: ₹${d.totals.total}</strong></div></div>`);
    w.document.write(`<div class="row"><img alt="QR" src="${qrUrl}"/></div>`);
    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f59e0b";
      case "processing": return "#a855f7";
      case "packed": return "#06b6d4";
      case "shipped": return "#3b82f6";
      case "delivered": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Icon.Clock style={{ marginRight: 6 }} />;
      case "processing": return <Icon.Wrench style={{ marginRight: 6 }} />;
      case "packed": return <Icon.Box style={{ marginRight: 6 }} />;
      case "shipped": return <Icon.Truck style={{ marginRight: 6 }} />;
      case "delivered": return <Icon.Check style={{ marginRight: 6 }} />;
      case "cancelled": return <Icon.Cross style={{ marginRight: 6 }} />;
      default: return null;
    }
  };

  const renderOverview = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.customer || 'Unknown')).size;

    return (
      <div className="dashboard-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" aria-label="Total revenue" title="Total revenue"><Icon.Money /></div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(totalRevenue)}</p>
              <span className="stat-change positive">Live</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-label="Total orders" title="Total orders"><Icon.Box /></div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{totalOrders.toLocaleString('en-IN')}</p>
              <span className="stat-change positive">Live</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-label="Customers" title="Customers"><Icon.Users /></div>
            <div className="stat-content">
              <h3>Customers</h3>
              <p className="stat-value">{uniqueCustomers.toLocaleString('en-IN')}</p>
              <span className="stat-change positive">Live</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-label="Products" title="Products"><Icon.Chart /></div>
            <div className="stat-content">
              <h3>Products</h3>
              <p className="stat-value">{products.length.toLocaleString('en-IN')}</p>
              <span className="stat-change neutral">Active</span>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>Sales Analytics</h3>
            <div className="chart-container" style={{padding:16, color:'#666'}}>
              <small>Open Reports tab for live charts.</small>
            </div>
          </div>
          <div className="chart-card">
            <h3>Revenue Trend</h3>
            <div className="chart-container" style={{padding:16, color:'#666'}}>
              <small>Open Reports tab for live charts.</small>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Orders</h3>
          <div className="activity-list">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="activity-item">
                <div className="activity-icon" aria-hidden="true"><Icon.Box /></div>
                <div className="activity-content">
                  <p><strong>{order.customer || 'Customer'}</strong> placed order <strong>{order.orderNumber || order.id}</strong></p>
                  <span className="activity-time">{order.date}</span>
                </div>
                <div className="activity-amount">{formatCurrency(order.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const ts = analyticsData?.timeseries || [];
    const cats = analyticsData?.byCategory || [];

    return (
      <div className="reports-section">
        <h2>Live Analytics</h2>
        {analyticsLoading && <p>Loading analytics...</p>}
        {analyticsError && <p style={{color:'red'}}>{analyticsError}</p>}
        {!analyticsLoading && !analyticsError && (
          <div className="reports-grid">
            <div className="report-card">
              <h3>Orders & Revenue</h3>
              <div style={{padding: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px'}}>
                <p style={{color:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', gap:8}}>
                  <Icon.Chart /> Chart temporarily disabled due to compatibility issues
                </p>
                <div style={{marginTop: '15px'}}>
                  <strong>Time Series Data:</strong>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px'}}>
                    <div style={{fontWeight: 'bold'}}>Period</div>
                    <div style={{fontWeight: 'bold'}}>Orders</div>
                    <div style={{fontWeight: 'bold'}}>Revenue (₹)</div>
                    {ts.map((t, i) => (
                      <React.Fragment key={i}>
                        <div>{t.period}</div>
                        <div>{Number(t.orders) || 0}</div>
                        <div>₹{Number(t.revenue) || 0}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="report-card">
              <h3>Sales by Category</h3>
              <div style={{padding: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px'}}>
                <p style={{color:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', gap:8}}>
                  <Icon.Chart /> Chart temporarily disabled due to compatibility issues
                </p>
                <div style={{marginTop: '15px'}}>
                  <strong>Category Data:</strong>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px'}}>
                    <div style={{fontWeight: 'bold'}}>Category</div>
                    <div style={{fontWeight: 'bold'}}>Quantity</div>
                    <div style={{fontWeight: 'bold'}}>Revenue (₹)</div>
                    {cats.map((c, i) => (
                      <React.Fragment key={i}>
                        <div>{c.category || 'Unknown'}</div>
                        <div>{Number(c.quantity) || 0}</div>
                        <div>₹{Number(c.revenue) || 0}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="reports-section">
      <h2>Settings</h2>
      <div className="report-card">
        <h3>General</h3>
        <p style={{color:'rgba(255,255,255,0.9)'}}>Add store settings, email templates, and permissions here.</p>
      </div>
    </div>
  );
  
  const renderOrders = () => {
    const filtered = ordersStatusFilter === 'all'
      ? orders
      : orders.filter(o => (o.status || '').toLowerCase() === ordersStatusFilter);

    return (
      <div className="orders-section">
        <div className="section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <h2>Order Management</h2>
          <div className="filters" style={{display:'flex', alignItems:'end', gap:8}}>
            <div className="form-group">
              <label>Status</label>
              <select value={ordersStatusFilter} onChange={e=>setOrdersStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {ordersLoading && <p>Loading orders...</p>}
        {ordersError && <p style={{color:'red'}}>{ordersError}</p>}

        <div className="users-table">
          <div className="table-header">
            <div className="header-cell">Order #</div>
            <div className="header-cell">Customer</div>
            <div className="header-cell">Date</div>
            <div className="header-cell">Items</div>
            <div className="header-cell">Total</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filtered.length === 0 && !ordersLoading && !ordersError && (
            <div className="table-row"><div className="table-cell" data-label="Info">No orders to display.</div></div>
          )}

          {filtered.map(o => (
            <div key={o.id} className="table-row">
              <div className="table-cell" data-label="Order #">{o.orderNumber || o.id}</div>
              <div className="table-cell" data-label="Customer">{o.customer || 'Customer'}</div>
              <div className="table-cell" data-label="Date">{o.date}</div>
              <div className="table-cell" data-label="Items">{o.items}</div>
              <div className="table-cell" data-label="Total">{formatCurrency(o.total)}</div>
              <div className="table-cell" data-label="Status">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(o.status) }}>
                  {getStatusIcon(o.status)} {o.status}
                </span>
              </div>
              <div className="table-cell" data-label="Actions" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <select
                  value={(o.status || 'pending')}
                  onChange={(e)=>handleUpdateOrderStatus(o.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="edit-btn" onClick={() => openOrderHistory(o.id)} aria-label="Order history">
                  <Icon.Scroll style={{marginRight:6}} /> History
                </button>
                <button className="edit-btn" onClick={() => openPrintLabel(o.id)} aria-label="Print label">
                  <Icon.Tag style={{marginRight:6}} /> Label
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="products-section">
      <div className="section-header">
        <h2>Product Management</h2>
        <button 
          className="add-btn"
          onClick={() => navigate('/admin/add-product')}
        >
          <Icon.Plus style={{marginRight:8}} /> Add Product
        </button>
      </div>

      {productsLoading && <p>Loading products...</p>}
      {productsError && <p style={{color:'red'}}>{productsError}</p>}


      <div className="products-grid">
        {products.length === 0 && !productsLoading && !productsError && (
          <div style={{gridColumn:'1 / -1', opacity:0.9}}>No products found.</div>
        )}
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img
                src={product.image}
                alt={product.name}
                onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = `${process.env.PUBLIC_URL}/logo.png`; }}
              />
            </div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <p className="product-category">{product.category}</p>
              <p className="product-price">{formatCurrency(product.price)}</p>
              <p className="product-stock">Stock: {product.stock}</p>
              <div className="product-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEditProduct(product)}
                  aria-label={`Edit ${product.name}`}
                >
                  <Icon.Edit style={{marginRight:6}} /> Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteProduct(product.id)} 
                  aria-label={`Delete ${product.name}`}
                >
                  <Icon.Trash style={{marginRight:6}} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const exportCsv = () => {
    const headers = ['Period', 'Orders', 'Revenue (₹)'];
    const rows = (reportData.labels || []).map((label, i) => [
      String(label),
      String(reportData.orders?.[i] ?? 0),
      String(reportData.revenue?.[i] ?? 0)
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Sales Report', marginX, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const meta = [];
    meta.push(`Interval: ${reportFilters.interval}`);
    if (reportFilters.from) meta.push(`From: ${reportFilters.from}`);
    if (reportFilters.to) meta.push(`To: ${reportFilters.to}`);
    doc.text(meta.join('    '), marginX, y);
    y += 12;

    const rows = reportData.labels.map((label, i) => [
      String(label),
      String(reportData.orders[i] ?? 0),
      String(reportData.revenue[i] ?? 0)
    ]);

    autoTable(doc, {
      startY: y + 8,
      head: [[ 'Period', 'Orders', 'Revenue (₹)' ]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59,130,246] },
      theme: 'grid',
      margin: { left: marginX, right: marginX },
    });

    const totalOrders = reportData.orders.reduce((a, b) => a + (Number(b) || 0), 0);
    const totalRevenue = reportData.revenue.reduce((a, b) => a + (Number(b) || 0), 0);
    const endY = doc.lastAutoTable.finalY + 16;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Orders: ${totalOrders}`, marginX, endY);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`, marginX + 220, endY);

    const filenameParts = ['sales-report', reportFilters.interval];
    if (reportFilters.from) filenameParts.push(reportFilters.from);
    if (reportFilters.to) filenameParts.push(reportFilters.to);
    const filename = filenameParts.join('_') + '.pdf';
    doc.save(filename);
  };

  const renderReports = () => (
    <div className="reports-section">
      <h2>Sales Reports</h2>
      <div className="report-filters" style={{display:'flex', gap:12, alignItems:'end', flexWrap:'wrap', marginBottom:12}}>
        <div className="form-group">
          <label>Interval</label>
          <select value={reportFilters.interval} onChange={e=>setReportFilters(prev=>({...prev, interval: e.target.value}))}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label>From</label>
          <input type="date" value={reportFilters.from} onChange={e=>setReportFilters(prev=>({...prev, from: e.target.value}))} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="date" value={reportFilters.to} onChange={e=>setReportFilters(prev=>({...prev, to: e.target.value}))} />
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>fetchReport(reportFilters)}>Apply</button>
          <button onClick={()=>{ setReportFilters({ interval:'day', from:'', to:'' }); }}>Reset</button>
          <button onClick={exportCsv}>Export CSV</button>
          <button onClick={exportPdf}>Export PDF</button>
        </div>
      </div>
      {reportLoading && <p>Loading reports...</p>}
      {reportError && <p style={{color:'red'}}>{reportError}</p>}
      <div className="reports-grid">
        <div className="report-card">
          <h3>Orders per Day</h3>
          <div style={{padding: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center'}}>
            <p style={{color:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', gap:8, justifyContent:'center'}}>
              <Icon.Chart /> Chart temporarily disabled due to compatibility issues
            </p>
            <div style={{marginTop: '10px'}}>
              <strong>Data Summary:</strong>
              <ul style={{listStyle: 'none', padding: 0}}>
                {reportData.labels.map((label, i) => (
                  <li key={i} style={{margin: '5px 0'}}>
                    {label}: {reportData.orders[i] || 0} orders
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="report-card">
          <h3>Revenue per Day</h3>
          <div style={{padding: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center'}}>
            <p style={{color:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', gap:8, justifyContent:'center'}}>
              <Icon.Chart /> Chart temporarily disabled due to compatibility issues
            </p>
            <div style={{marginTop: '10px'}}>
              <strong>Revenue Summary:</strong>
              <ul style={{listStyle: 'none', padding: 0}}>
                {reportData.labels.map((label, i) => (
                  <li key={i} style={{margin: '5px 0'}}>
                    {label}: ₹{reportData.revenue[i] || 0}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="report-card">
          <h3>Top Products</h3>
          <div className="top-products">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="top-product-item" style={{display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee'}}>
                <span className="rank" style={{marginRight: '10px', fontWeight: 'bold'}}>#{index + 1}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = `${process.env.PUBLIC_URL}/logo.png`; }}
                  style={{width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px'}}
                />
                <div className="product-details">
                  <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>{product.name}</h4>
                  <p style={{margin: 0, color: '#666'}}>{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="admin-dashboard"
      style={{
        // provide logo URL for CSS ::before via CSS variable
        "--dashboard-logo-url": `url(${process.env.PUBLIC_URL}/logo.png)`
      }}
    >
      <div className="dashboard-header">
        <div className="header-left">
          <h1>G Fresh Admin Dashboard</h1>
          <p>Manage your e-commerce operations</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
            <Icon.Door style={{marginRight:8}} /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <button className={`nav-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/overview')}>
            <Icon.Chart style={{marginRight:8}} /> Overview
          </button>
          <button className={`nav-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/users')}>
            <Icon.Users style={{marginRight:8}} /> Users
          </button>
          <button className={`nav-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/orders')}>
            <Icon.Truck style={{marginRight:8}} /> Orders
          </button>
          <button className={`nav-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/products')}>
            <Icon.Box style={{marginRight:8}} /> Products
          </button>
          <button className={`nav-btn ${activeTab === "reports" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/reports')}>
            <Icon.Chart style={{marginRight:8}} /> Reports
          </button>
          <button className={`nav-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/analytics')}>
            <Icon.Chart style={{marginRight:8}} /> Analytics
          </button>
          <button className={`nav-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => navigate('/admin/dashboard/settings')}>
            <Icon.Gear style={{marginRight:8}} /> Settings
          </button>
        </aside>
        <main className="dashboard-content">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </main>
      </div>

      {labelModal.open && labelModal.data && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Print Shipping Label</h3>
              <button className="close-btn" onClick={closeLabelModal} aria-label="Close">
                <Icon.Cross />
              </button>
            </div>
            <div className="modal-content">
              <p>Order: <strong>{labelModal.data.orderNumber}</strong></p>
              <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(JSON.stringify(labelModal.data.qrPayload))}`} />
            </div>
            <div className="form-actions">
              <button onClick={printLabelNow}>Print</button>
              <button onClick={closeLabelModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="close-btn" onClick={closeEditModal} aria-label="Close">
                <Icon.Cross />
              </button>
            </div>
            <div className="modal-content">
              <ProductForm 
                product={editingProduct}
                onSave={handleUpdateProduct}
                onCancel={closeEditModal}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}

      {popup.show && (
        <div className={`popup-notification ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
};

// Wrap the AdminDashboard with ThemeProvider
const AdminDashboard = () => (
  <ThemeProvider>
    <AdminDashboardContent />
  </ThemeProvider>
);

export default AdminDashboard;