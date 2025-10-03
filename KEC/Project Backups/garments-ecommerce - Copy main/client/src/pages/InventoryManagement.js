import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchInventoryData();
    fetchLowStockItems();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/inventory/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error('Inventory fetch error:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/inventory/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLowStockItems(response.data.data);
      }
    } catch (error) {
      console.error('Low stock fetch error:', error);
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`/api/inventory/stock/${productId}`, 
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update local state
        setInventory(prev => prev.map(item => 
          item._id === productId ? { ...item, stock: newStock } : item
        ));
        
        // Refresh low stock items
        fetchLowStockItems();
      }
    } catch (error) {
      console.error('Stock update error:', error);
      alert('Failed to update stock');
    }
  };

  const bulkUpdateStock = async () => {
    if (selectedItems.length === 0 || !bulkStockValue) {
      alert('Please select items and enter a stock value');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put('/api/inventory/bulk-update', 
        { 
          productIds: selectedItems,
          stock: parseInt(bulkStockValue)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update local state
        setInventory(prev => prev.map(item => 
          selectedItems.includes(item._id) 
            ? { ...item, stock: parseInt(bulkStockValue) } 
            : item
        ));
        
        // Reset bulk update mode
        setBulkUpdateMode(false);
        setSelectedItems([]);
        setBulkStockValue('');
        
        // Refresh low stock items
        fetchLowStockItems();
        
        alert('Stock updated successfully');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Failed to update stock');
    }
  };

  const sendLowStockAlert = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/inventory/send-alert', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Low stock alert sent successfully');
      }
    } catch (error) {
      console.error('Alert send error:', error);
      alert('Failed to send alert');
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(item => item._id));
    }
  };

  const getStockStatus = (stock, lowStockThreshold = 10) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return '#dc3545';
      case 'low-stock': return '#ffc107';
      case 'in-stock': return '#28a745';
      default: return '#6c757d';
    }
  };

  const filteredInventory = inventory
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  if (loading) {
    return (
      <div className="inventory-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-warning"
            onClick={sendLowStockAlert}
          >
            Send Low Stock Alert
          </button>
          <button 
            className={`btn ${bulkUpdateMode ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
          >
            {bulkUpdateMode ? 'Cancel Bulk Update' : 'Bulk Update'}
          </button>
        </div>
      </div>

      <div className="inventory-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('low-stock')}
        >
          Low Stock ({lowStockItems.length})
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="inventory-overview">
          <div className="inventory-controls">
            <div className="search-sort-controls">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="stock">Sort by Stock</option>
                <option value="price">Sort by Price</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {bulkUpdateMode && (
              <div className="bulk-update-controls">
                <input
                  type="number"
                  placeholder="New stock quantity"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  className="bulk-stock-input"
                />
                <button
                  onClick={bulkUpdateStock}
                  className="btn btn-success"
                  disabled={selectedItems.length === 0 || !bulkStockValue}
                >
                  Update Selected ({selectedItems.length})
                </button>
              </div>
            )}
          </div>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  {bulkUpdateMode && (
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredInventory.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.stock);
                  return (
                    <tr key={item._id}>
                      {bulkUpdateMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleItemSelect(item._id)}
                          />
                        </td>
                      )}
                      <td>
                        <div className="product-info">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="product-image" />
                          )}
                          <div>
                            <div className="product-name">{item.name}</div>
                            <div className="product-sku">SKU: {item._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <StockInput
                          value={item.stock}
                          onChange={(newStock) => updateStock(item._id, newStock)}
                          disabled={bulkUpdateMode}
                        />
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStockStatusColor(status) }}
                        >
                          {status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {/* Navigate to product edit */}}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'low-stock' && (
        <div className="low-stock-section">
          <div className="low-stock-header">
            <h3>Low Stock Items</h3>
            <p>Items that need immediate attention</p>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="no-low-stock">
              <div className="success-icon">✅</div>
              <h3>All Good!</h3>
              <p>No items are currently low in stock.</p>
            </div>
          ) : (
            <div className="low-stock-grid">
              {lowStockItems.map((item) => (
                <div key={item._id} className="low-stock-card">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="card-image" />
                  )}
                  <div className="card-content">
                    <h4>{item.name}</h4>
                    <p className="card-category">{item.category}</p>
                    <div className="stock-info">
                      <span className="current-stock">Current: {item.stock}</span>
                      <span className="threshold">Threshold: {item.lowStockThreshold || 10}</span>
                    </div>
                    <div className="card-actions">
                      <StockInput
                        value={item.stock}
                        onChange={(newStock) => updateStock(item._id, newStock)}
                        className="compact"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Stock Input Component
const StockInput = ({ value, onChange, disabled, className }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = () => {
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onChange(newValue);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing && !disabled) {
    return (
      <div className={`stock-input-container ${className || ''}`}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleSubmit}
          className="stock-input"
          min="0"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div 
      className={`stock-display ${className || ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && setIsEditing(true)}
    >
      {value}
      {!disabled && <span className="edit-hint">✏️</span>}
    </div>
  );
};

export default InventoryManagement;
