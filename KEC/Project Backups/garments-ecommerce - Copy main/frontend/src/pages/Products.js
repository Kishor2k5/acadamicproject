import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { formatPriceInRupeesSymbol } from "../utils/currency";
import "./Products.css";
import { CartContext } from "../contexts/CartContext";
import { getProducts } from "../api/products";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 25000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const productsPerPage = 12;
  const { addToCart } = useContext(CartContext);
  
  // Enhanced sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      description: "Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with breathable fabric.",
      price: 2499,
      originalPrice: 3299,
      category: "shirts",
      image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop"
      ],
      rating: 4.5,
      reviews: 128,
      inStock: true,
      freeShipping: true,
      brand: "Cotton Comfort",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Green", "Navy", "Gray"]
    },
    {
      id: 2,
      name: "Classic Denim Jeans",
      description: "High-quality denim jeans with perfect fit and durability. Premium stretch denim for all-day comfort.",
      price: 6599,
      originalPrice: 8299,
      category: "pants",
      image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=600&fit=crop"
      ],
      rating: 4.8,
      reviews: 256,
      inStock: true,
      freeShipping: true,
      brand: "Denim Co",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Blue", "Black", "Light Blue"]
    },
    {
      id: 3,
      name: "Casual Hoodie",
      description: "Warm and comfortable hoodie for cool weather. Perfect for casual outings and weekend relaxation.",
      price: 4999,
      originalPrice: 6199,
      category: "hoodies",
      image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop"
      ],
      rating: 4.6,
      reviews: 167,
      inStock: true,
      freeShipping: true,
      brand: "Comfort Zone",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Green", "Gray", "Navy"]
    },
    {
      id: 4,
      name: "Formal Dress Shirt",
      description: "Professional dress shirt for business meetings and formal events. Wrinkle-free fabric with modern fit.",
      price: 7499,
      originalPrice: 9099,
      category: "shirts",
      image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop"
      ],
      rating: 4.7,
      reviews: 203,
      inStock: true,
      freeShipping: true,
      brand: "Executive Style",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Light Blue", "Black"]
    },
    {
      id: 5,
      name: "Slim Fit Chinos",
      description: "Modern slim-fit chinos for a contemporary look. Versatile pants suitable for both casual and semi-formal occasions.",
      price: 5799,
      originalPrice: 7049,
      category: "pants",
      image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=600&fit=crop"
      ],
      rating: 4.4,
      reviews: 145,
      inStock: true,
      freeShipping: true,
      brand: "Modern Fit",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Khaki", "Navy", "Black", "Olive"]
    },
    {
      id: 6,
      name: "Summer Dress",
      description: "Light and breezy summer dress perfect for warm days. Floral pattern with comfortable fit.",
      price: 7499,
      originalPrice: 9949,
      category: "dresses",
      image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1564257631407-3deb25f9c8e8?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop"
      ],
      rating: 4.9,
      reviews: 312,
      inStock: true,
      freeShipping: true,
      brand: "Summer Breeze",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral", "Solid Green", "Navy", "Black"]
    },
    {
      id: 7,
      name: "Leather Jacket",
      description: "Stylish leather jacket for a bold and confident look. Genuine leather with premium craftsmanship.",
      price: 16599,
      originalPrice: 20749,
      category: "jackets",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"
      ],
      rating: 4.8,
      reviews: 178,
      inStock: true,
      freeShipping: false,
      brand: "Leather Craft",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Brown", "Dark Green"]
    },
    {
      id: 8,
      name: "Winter Sweater",
      description: "Cozy winter sweater to keep you warm and stylish. Soft wool blend with classic design.",
      price: 6249,
      originalPrice: 7899,
      category: "sweaters",
      image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop"
      ],
      rating: 4.6,
      reviews: 234,
      inStock: true,
      freeShipping: true,
      brand: "Warm & Cozy",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Green", "Black", "Gray", "Burgundy"]
    }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        console.log('API Response:', response?.data);
        const apiProducts = response?.data?.data || response?.data || [];
        
        // Transform API products to match expected format
        const transformedProducts = apiProducts.map(product => ({
          id: product._id || product.id,
          name: product.name,
          description: product.description || 'No description available',
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          category: product.category,
          image_url: product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image',
          rating: product.rating || 4.0,
          reviews: product.reviews || 0,
          inStock: (product.stock || 0) > 0,
          freeShipping: product.freeShipping !== false,
          brand: product.brand || 'G Fresh',
          stock: product.stock || 0
        }));
        
        console.log('Transformed products:', transformedProducts);
        
        // Combine API products with sample data
        const allProducts = [...transformedProducts, ...sampleProducts];
        setProducts(allProducts);
        
      } catch (error) {
        console.error('Error loading products:', error);
        // Fall back to sample data on error
        setProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Add function to refresh products (can be called after adding new product)
  const refreshProducts = async () => {
    try {
      const response = await getProducts();
      const apiProducts = response?.data?.data || response?.data || [];
      
      const transformedProducts = apiProducts.map(product => ({
        id: product._id || product.id,
        name: product.name,
        description: product.description || 'No description available',
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        category: product.category,
        image_url: product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image',
        rating: product.rating || 4.0,
        reviews: product.reviews || 0,
        inStock: (product.stock || 0) > 0,
        prime: product.prime || false,
        freeShipping: product.freeShipping !== false,
        brand: product.brand || 'G Fresh',
        stock: product.stock || 0
      }));
      
      const allProducts = [...transformedProducts, ...sampleProducts];
      setProducts(allProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Enhanced filtering and sorting
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= selectedRating;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
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
        // For API products, use creation date if available, otherwise use ID
        return (b.createdAt || b.id) - (a.createdAt || a.id);
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
    if (e) e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
      image: product.image_url,
      quantity: 1
    });
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
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
          <button 
            onClick={refreshProducts}
            className="refresh-btn"
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
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
              <div className="price-sliders">
                <div className="slider-container">
                  <label>Min: ₹{priceRange[0]}</label>
                  <input
                    type="range"
                    min="0"
                    max={priceRange[1] - 100} // Ensure min is always less than max
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="price-slider"
                  />
                </div>
                <div className="slider-container">
                  <label>Max: ₹{priceRange[1]}</label>
                  <input
                    type="range"
                    min={Math.max(priceRange[0] + 100, 100)} // Ensure max is always greater than min
                    max="25000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="price-slider"
                  />
                </div>
              </div>
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
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image-container">
                  <img src={product.image_url} alt={product.name} className="product-image" />
                  {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
                </div>
                
                <div className="product-details">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-rating">
                    <div className="stars">{renderStars(product.rating)}</div>
                    <span className="rating-count">({product.reviews})</span>
                  </div>
                  
                  <div className="product-price">
                    <span className="current-price">{formatPriceInRupeesSymbol(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">{formatPriceInRupeesSymbol(product.originalPrice)}</span>
                    )}
                  </div>
                  
                  <div className="product-shipping">
                    {product.freeShipping && <span className="free-shipping">FREE Shipping</span>}
                  </div>
                  
                  <div className="product-brand">by {product.brand}</div>
                  
                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, e);
                      }}
                      disabled={!product.inStock}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product, e);
                      }}
                      disabled={!product.inStock}
                    >
                      Buy Now
                    </button>
                  </div>
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

export default Products;
