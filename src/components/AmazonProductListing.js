import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { formatPriceInRupeesSymbol } from "../utils/currency";
import "./AmazonProductListing.css";
import { CartContext } from "../contexts/CartContext";

const AmazonProductListing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useContext(CartContext);
  
  const productsPerPage = 16;

  // Enhanced sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      description: "Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with breathable fabric.",
      price: 29.99,
      originalPrice: 39.99,
      category: "shirts",
      image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Cotton Comfort",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Green", "Navy", "Gray"]
    },
    {
      id: 2,
      name: "Classic Denim Jeans",
      description: "High-quality denim jeans with perfect fit and durability. Premium stretch denim for all-day comfort.",
      price: 79.99,
      originalPrice: 99.99,
      category: "pants",
      image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 256,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Denim Co",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Blue", "Black", "Light Blue"]
    },
    {
      id: 3,
      name: "Casual Hoodie",
      description: "Warm and comfortable hoodie for cool weather. Perfect for casual outings and weekend relaxation.",
      price: 59.99,
      originalPrice: 74.99,
      category: "hoodies",
      image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 167,
      inStock: true,
      prime: false,
      freeShipping: true,
      brand: "Comfort Zone",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Green", "Gray", "Navy"]
    },
    {
      id: 4,
      name: "Formal Dress Shirt",
      description: "Professional dress shirt for business meetings and formal events. Wrinkle-free fabric with modern fit.",
      price: 89.99,
      originalPrice: 109.99,
      category: "shirts",
      image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 203,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Executive Style",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Light Blue", "Black"]
    },
    {
      id: 5,
      name: "Slim Fit Chinos",
      description: "Modern slim-fit chinos for a contemporary look. Versatile pants suitable for both casual and semi-formal occasions.",
      price: 69.99,
      originalPrice: 84.99,
      category: "pants",
      image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 145,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Modern Fit",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Khaki", "Navy", "Black", "Olive"]
    },
    {
      id: 6,
      name: "Summer Dress",
      description: "Light and breezy summer dress perfect for warm days. Floral pattern with comfortable fit.",
      price: 89.99,
      originalPrice: 119.99,
      category: "dresses",
      image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews: 312,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Summer Breeze",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral", "Solid Green", "Navy", "Black"]
    },
    {
      id: 7,
      name: "Leather Jacket",
      description: "Stylish leather jacket for a bold and confident look. Genuine leather with premium craftsmanship.",
      price: 199.99,
      originalPrice: 249.99,
      category: "jackets",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 178,
      inStock: true,
      prime: false,
      freeShipping: false,
      brand: "Leather Craft",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Brown", "Dark Green"]
    },
    {
      id: 8,
      name: "Winter Sweater",
      description: "Cozy winter sweater to keep you warm and stylish. Soft wool blend with classic design.",
      price: 74.99,
      originalPrice: 94.99,
      category: "sweaters",
      image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 234,
      inStock: true,
      prime: true,
      freeShipping: true,
      brand: "Warm & Cozy",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Green", "Black", "Gray", "Burgundy"]
    }
  ];

  useEffect(() => {
    const loadProducts = () => {
      setTimeout(() => {
        setProducts(sampleProducts);
        setLoading(false);
      }, 1000);
    };
    loadProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= selectedRating;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPrice && matchesRating && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id;
      case "popularity":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const categories = [
    { value: "all", label: "All Categories", count: products.length },
    { value: "shirts", label: "Shirts", count: products.filter(p => p.category === "shirts").length },
    { value: "pants", label: "Pants", count: products.filter(p => p.category === "pants").length },
    { value: "dresses", label: "Dresses", count: products.filter(p => p.category === "dresses").length },
    { value: "jackets", label: "Jackets", count: products.filter(p => p.category === "jackets").length },
    { value: "sweaters", label: "Sweaters", count: products.filter(p => p.category === "sweaters").length },
    { value: "hoodies", label: "Hoodies", count: products.filter(p => p.category === "hoodies").length }
  ];

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="pagination-btn">
          ‹ Previous
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="pagination-btn">
          Next ›
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="amazon-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="amazon-product-listing">
      {/* Header */}
      <div className="amazon-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="amazon-container">
        {/* Sidebar Filters */}
        <div className="amazon-sidebar">
          <div className="filter-section">
            <h3>Category</h3>
            {categories.map(category => (
              <label key={category.value} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={selectedCategory === category.value}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span>{category.label} ({category.count})</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3>Customer Review</h3>
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="filter-option">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={selectedRating === rating}
                  onChange={(e) => setSelectedRating(Number(e.target.value))}
                />
                <span className="rating-filter">
                  {renderStars(rating)} & Up
                </span>
              </label>
            ))}
            <label className="filter-option">
              <input
                type="radio"
                name="rating"
                value={0}
                checked={selectedRating === 0}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
              />
              <span>All Ratings</span>
            </label>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="price-slider"
              />
              <div className="price-display">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="amazon-main">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                {filteredProducts.length} results for "{searchTerm || 'all products'}"
              </span>
            </div>
            <div className="sort-options">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="amazon-products-grid">
            {currentProducts.map(product => (
              <div 
                key={product.id} 
                className="amazon-product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image-container">
                  <img src={product.image_url} alt={product.name} className="product-image" />
                  {product.prime && <div className="prime-badge">Prime</div>}
                  {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
                </div>
                
                <div className="product-details">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-rating">
                    <div className="stars">{renderStars(product.rating)}</div>
                    <span className="rating-count">({product.reviews})</span>
                  </div>
                  
                  <div className="product-price">
                    <span className="current-price">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">₹{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="product-shipping">
                    {product.freeShipping && <span className="free-shipping">FREE Shipping</span>}
                    {product.prime && <span className="prime-shipping">Prime</span>}
                  </div>
                  
                  <div className="product-brand">by {product.brand}</div>
                  
                  <button 
                    className="add-to-cart-amazon"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="amazon-pagination">
              {renderPagination()}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="no-results">
              <h3>No results found</h3>
              <p>Try different keywords or remove search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmazonProductListing;
