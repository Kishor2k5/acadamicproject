import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [tab, setTab] = useState("overview");
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [meRes, ordersRes] = await Promise.all([
          axios.get("/api/auth/me", { headers }),
          axios.get("/api/orders", { headers })
        ]);
        setMe(meRes.data?.data || null);
        setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
      } catch (e) {
        const msg = e.response?.data?.message || "Failed to load profile data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page error">
        <p className="error-text">{error}</p>
        <Link className="btn primary" to="/products">Go to Products</Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="avatar">
          {me?.avatar ? (
            <img src={me.avatar} alt={me.name || me.email} />
          ) : (
            <div className="avatar-fallback">{(me?.name || me?.email || "U").slice(0,1).toUpperCase()}</div>
          )}
        </div>
        <div className="user-meta">
          <h1>{me?.name || "Your Account"}</h1>
          <p>{me?.email}</p>
          {me?.role && <span className="badge">{me.role}</span>}
        </div>
      </header>

      <nav className="profile-tabs">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Order History</button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Settings</button>
      </nav>

      <section className="profile-content">
        {tab === "overview" && (
          <div className="card">
            <h2>Account Details</h2>
            <div className="details-grid">
              <div>
                <label>Name</label>
                <div>{me?.name || "-"}</div>
              </div>
              <div>
                <label>Email</label>
                <div>{me?.email || "-"}</div>
              </div>
              {me?.phone && (
                <div>
                  <label>Phone</label>
                  <div>{me.phone}</div>
                </div>
              )}
              {me?.address && (
                <div className="address">
                  <label>Address</label>
                  <div>
                    {[me.address?.street, me.address?.city, me.address?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="card">
            <h2>Order History</h2>
            {orders.length === 0 ? (
              <p>No orders yet. <Link to="/products">Start shopping</Link>.</p>
            ) : (
              <ul className="orders-list">
                {orders.map((o) => (
                  <li key={o._id} className="order-item">
                    <div className="order-row">
                      <div>
                        <div className="muted">Order</div>
                        <div className="strong">{o.orderNumber || o._id.slice(-8)}</div>
                      </div>
                      <div>
                        <div className="muted">Status</div>
                        <div className={`status ${o.status}`}>{o.status}</div>
                      </div>
                      <div>
                        <div className="muted">Total</div>
                        <div className="strong">${Number(o.totalAmount || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="muted">Placed</div>
                        <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="items-row">
                      {(o.items || []).slice(0,3).map((it, idx) => (
                        <div key={idx} className="mini-item">
                          {it.image ? <img src={it.image} alt={it.name} /> : <div className="img-ph" />}
                          <span>{it.name}</span>
                          <span>x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="card">
            <h2>Settings</h2>
            <p>Profile editing and password change can be added here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
