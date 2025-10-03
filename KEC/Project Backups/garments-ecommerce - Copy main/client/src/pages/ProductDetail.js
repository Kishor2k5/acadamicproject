import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatPriceInRupeesSymbol } from "../utils/currency";
import { CartContext } from "../contexts/CartContext";
import FloatingBackButton from "../components/FloatingBackButton";
import { getProducts } from "../api/products";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Enhanced sample products data (exactly matching Products.js)
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
      prime: true,
      freeShipping: true,
      brand: "Cotton Comfort",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Green", "Navy", "Gray"],
      material: "100% Organic Cotton",
      care: "Machine wash cold, tumble dry low",
      features: ["Breathable fabric", "Modern fit", "Pre-shrunk", "Eco-friendly"]
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
      prime: true,
      freeShipping: true,
      brand: "Denim Co",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Blue", "Black", "Light Blue"],
      material: "98% Cotton, 2% Elastane",
      care: "Machine wash cold, hang dry",
      features: ["Stretch denim", "Classic fit", "Durable construction", "Fade-resistant"]
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
      prime: false,
      freeShipping: true,
      brand: "Comfort Zone",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Green", "Gray", "Navy"],
      material: "Cotton Blend",
      care: "Machine wash cold, tumble dry low",
      features: ["Fleece lining", "Kangaroo pocket", "Adjustable hood", "Comfortable fit"]
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
      prime: true,
      freeShipping: true,
      brand: "Executive Style",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Light Blue", "Black"],
      material: "Cotton Poplin",
      care: "Machine wash cold, iron as needed",
      features: ["Wrinkle-resistant", "Crisp collar", "Perfect fit", "Professional look"]
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
      prime: true,
      freeShipping: true,
      brand: "Modern Fit",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Khaki", "Navy", "Black", "Olive"],
      material: "Cotton Twill",
      care: "Machine wash cold, tumble dry low",
      features: ["Slim fit", "Modern taper", "Comfortable stretch", "Versatile styling"]
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
      prime: true,
      freeShipping: true,
      brand: "Summer Breeze",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral", "Solid Green", "Navy", "Black"],
      material: "Rayon Blend",
      care: "Hand wash cold, hang dry",
      features: ["Lightweight fabric", "Elastic waist", "A-line silhouette", "Perfect for summer"]
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
      prime: false,
      freeShipping: false,
      brand: "Leather Craft",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Brown", "Dark Green"],
      material: "Genuine Leather",
      care: "Professional leather care recommended",
      features: ["Genuine leather", "Quilted panels", "Classic biker style", "Durable construction"]
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
      prime: true,
      freeShipping: true,
      brand: "Warm & Cozy",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Green", "Black", "Gray", "Burgundy"],
      material: "Wool Blend",
      care: "Hand wash cold, lay flat to dry",
      features: ["Chunky knit", "Warm fabric", "Comfortable fit", "Classic design"]
    }
  ];

  useEffect(() => {
    const loadProduct = async () => {
      console.log('Loading product with ID:', id);
      setLoading(true);
      
      try {
        // First try to get products from API
        const response = await getProducts();
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
          images: product.images || [product.image || 'https://via.placeholder.com/400x400?text=No+Image'],
          rating: product.rating || 4.0,
          reviews: product.reviews || 0,
          inStock: (product.stock || 0) > 0,
          prime: product.prime || false,
          freeShipping: product.freeShipping !== false,
          brand: product.brand || 'G Fresh',
          stock: product.stock || 0,
          material: product.material || "Premium Quality Material",
          care: product.care || "Follow care instructions on label",
          features: product.features || ["High quality", "Comfortable fit", "Durable material"],
          sizes: product.sizes || ["S", "M", "L", "XL"],
          colors: product.colors || ["Black", "White"]
        }));
        
        // Combine API products with sample data
        const allProducts = [...transformedProducts, ...sampleProducts];
        console.log('All available products:', allProducts.map(p => ({ id: p.id, name: p.name })));
        
        // Find product by ID (handle both string and number IDs)
        const foundProduct = allProducts.find(p => 
          p.id === id || p.id === parseInt(id) || String(p.id) === String(id)
        );
        
        console.log('Found product:', foundProduct);
        setProduct(foundProduct);
        
      } catch (error) {
        console.error('Error loading products:', error);
        // Fall back to sample data on error
        console.log('Falling back to sample products');
        const foundProduct = sampleProducts.find(p => 
          p.id === id || p.id === parseInt(id) || String(p.id) === String(id)
        );
        setProduct(foundProduct);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    // Related products: same category, excluding current product
    const related = sampleProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    setRelatedProducts(related);

    // Mock reviews for demo
    const mockReviews = [
      { id: 1, user: "Aarav", rating: 5, date: "2025-07-10", comment: "Excellent quality and perfect fit!" },
      { id: 2, user: "Diya", rating: 4, date: "2025-06-22", comment: "Very comfortable. Worth the price." },
      { id: 3, user: "Rahul", rating: 5, date: "2025-05-15", comment: "Loved it! Will buy again." }
    ];
    setReviews(mockReviews);
  }, [product]);

  const showPopupMessage = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      showPopupMessage("Please select a size", "error");
      return;
    }
    
    if (!product.inStock) {
      showPopupMessage("This product is currently out of stock", "error");
      return;
    }

    // Create cart item with proper structure
    const cartItem = {
      ...product,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity: quantity
    };

    // Add to cart using context
    addToCart(cartItem);
    showPopupMessage(`${quantity} ${product.name} added to cart!`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    console.log('Product not found for ID:', id);
    return (
      <div className="error">
        <h2>Product not found</h2>
        <p>Product with ID "{id}" could not be found.</p>
        <Link to="/products">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <FloatingBackButton disabled={loading} />
      <div className="product-detail-container">
        <div className="breadcrumb">
          <Link to="/products">Products</Link>
          <span> / </span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images ? product.images[selectedImageIndex] : product.image_url} 
                alt={product.name} 
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-detail">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="product-rating-detail">
                <div className="stars">
                  {renderStars(product.rating)}
                </div>
                <span className="rating-text">{product.rating} out of 5</span>
                <span className="review-count">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="product-price-detail">
              <span className="price-large">{formatPriceInRupeesSymbol(product.price)}</span>
              {product.inStock ? (
                <span className="in-stock">In Stock</span>
              ) : (
                <span className="out-of-stock-badge">Out of Stock</span>
              )}
            </div>

            <div className="product-description-detail">
              <p>{product.description}</p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selection">
                <h3>Select Size</h3>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="color-selection">
                <h3>Select Color</h3>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button 
                className="add-to-cart-btn-large"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                className="buy-now-btn"
                onClick={() => {
                  if (!selectedSize && product.sizes && product.sizes.length > 0) {
                    showPopupMessage("Please select a size", "error");
                    return;
                  }
                  const cartItem = {
                    ...product,
                    price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
                    selectedSize: selectedSize,
                    selectedColor: selectedColor,
                    quantity: quantity
                  };
                  addToCart(cartItem);
                  navigate('/cart');
                }}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Buy Now' : 'Out of Stock'}
              </button>
            </div>

            <div className="product-details">
              <div className="detail-section">
                <h3>Product Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Material:</span>
                    <span className="detail-value">{product.material}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Care:</span>
                    <span className="detail-value">{product.care}</span>
                  </div>
                  {product.colors && (
                    <div className="detail-item">
                      <span className="detail-label">Colors:</span>
                      <span className="detail-value">{product.colors.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {product.features && (
                <div className="features-section">
                  <h3>Features</h3>
                  <ul className="features-list">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <div className="section-header">
            <h2>Related Products</h2>
            <Link className="view-all-link" to="/products">View all</Link>
          </div>
          <div className="related-grid">
            {relatedProducts.map(rp => (
              <div
                key={rp.id}
                className="related-card"
                onClick={() => navigate(`/product/${rp.id}`)}
              >
                <div className="related-image">
                  <img src={rp.image_url} alt={rp.name} />
                </div>
                <div className="related-info">
                  <h4 className="related-name">{rp.name}</h4>
                  <div className="related-meta">
                    <span className="related-price">{formatPriceInRupeesSymbol(rp.price)}</span>
                    <span className="related-reviews">★ {rp.rating} ({rp.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-user">{review.user}</div>
                <div className="review-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {showPopup && (
        <div className={`notification-popup ${popupType}`}>
          <div className="popup-content">
            <div className="popup-icon">
              {popupType === "success" ? "✓" : "✕"}
            </div>
            <div className="popup-message">{popupMessage}</div>
            <button 
              className="popup-close"
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 