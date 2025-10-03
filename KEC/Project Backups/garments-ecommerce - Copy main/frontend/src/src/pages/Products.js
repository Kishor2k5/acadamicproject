import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products").then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {products.map(product => (
          <div key={product.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <img src={product.image_url} alt={product.name} width={100} /><br/>
            <b>{product.name}</b><br/>
            ${product.price}<br/>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
