import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", image_url: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/products", form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setForm({ name: "", description: "", price: "", image_url: "" });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchProducts();
  };

  return (
    <div>
      <h2>Admin Product Management</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} />
        <button type="submit">Add Product</button>
      </form>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;