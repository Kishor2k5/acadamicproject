import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCreateProduct } from "../api/productsAdmin";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    category: "shirts",
    brand: "",
    sku: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: ""
    },
    tags: "",
    features: [""],
    specifications: [{ key: "", value: "" }],
    seoTitle: "",
    seoDescription: "",
    metaKeywords: ""
  });
  
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");

  const categories = [
    "shirts", "pants", "dresses", "hoodies", "jackets", 
    "sweaters", "suits", "accessories", "shoes", "bags"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }]
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const form = new FormData();
      
      // Add basic product data
      Object.keys(formData).forEach(key => {
        if (key === 'dimensions') {
          form.append('dimensions', JSON.stringify(formData.dimensions));
        } else if (key === 'features') {
          form.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
        } else if (key === 'specifications') {
          const validSpecs = formData.specifications.filter(s => s.key.trim() && s.value.trim());
          form.append('specifications', JSON.stringify(validSpecs));
        } else if (key === 'tags') {
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          form.append('tags', JSON.stringify(tagsArray));
        } else {
          form.append(key, formData[key]);
        }
      });

      // Add images
      images.forEach(image => {
        form.append('images', image);
      });

      await adminCreateProduct(form, token);
      navigate('/admin/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error?.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="Enter brand name"
          />
        </div>

        <div className="form-group">
          <label>SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            placeholder="Stock Keeping Unit"
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed product description"
            rows={4}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g., summer, casual, cotton"
          />
        </div>
      </div>
    </div>
  );

  const renderPricingInventory = () => (
    <div className="form-section">
      <h3>Pricing & Inventory</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Original Price (₹)</label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Stock Quantity *</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="0.0"
            step="0.1"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Length (cm)</label>
          <input
            type="number"
            name="dimensions.length"
            value={formData.dimensions.length}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Width (cm)</label>
          <input
            type="number"
            name="dimensions.width"
            value={formData.dimensions.width}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            name="dimensions.height"
            value={formData.dimensions.height}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="form-section">
      <h3>Product Images</h3>
      <div className="image-upload-section">
        <div className="upload-area">
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          <label htmlFor="images" className="upload-label">
            <div className="upload-content">
              <span className="upload-icon">📷</span>
              <span>Click to upload images</span>
              <small>Support: JPG, PNG, GIF (Max 5MB each)</small>
            </div>
          </label>
        </div>

        {previewUrls.length > 0 && (
          <div className="image-preview-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="image-preview">
                <img src={url} alt={`Preview ${index + 1}`} />
                {index === 0 && <span className="main-badge">MAIN</span>}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="form-section">
      <h3>Features & Specifications</h3>
      
      <div className="subsection">
        <h4>Product Features</h4>
        {formData.features.map((feature, index) => (
          <div key={index} className="feature-input">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="Enter product feature"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addFeature} className="add-btn">
          + Add Feature
        </button>
      </div>

      <div className="subsection">
        <h4>Specifications</h4>
        {formData.specifications.map((spec, index) => (
          <div key={index} className="spec-input">
            <input
              type="text"
              value={spec.key}
              onChange={(e) => updateSpecification(index, 'key', e.target.value)}
              placeholder="Specification name"
            />
            <input
              type="text"
              value={spec.value}
              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
              placeholder="Specification value"
            />
            <button
              type="button"
              onClick={() => removeSpecification(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addSpecification} className="add-btn">
          + Add Specification
        </button>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="form-section">
      <h3>SEO & Marketing</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>SEO Title</label>
          <input
            type="text"
            name="seoTitle"
            value={formData.seoTitle}
            onChange={handleInputChange}
            placeholder="SEO optimized title"
            maxLength="60"
          />
          <small>{formData.seoTitle.length}/60 characters</small>
        </div>

        <div className="form-group full-width">
          <label>SEO Description</label>
          <textarea
            name="seoDescription"
            value={formData.seoDescription}
            onChange={handleInputChange}
            placeholder="SEO meta description"
            rows={3}
            maxLength="160"
          />
          <small>{formData.seoDescription.length}/160 characters</small>
        </div>

        <div className="form-group full-width">
          <label>Meta Keywords</label>
          <input
            type="text"
            name="metaKeywords"
            value={formData.metaKeywords}
            onChange={handleInputChange}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="add-product-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>
          <h1>Add New Product</h1>
          <p>Create a new product listing for your store</p>
        </div>
      </div>

      <div className="add-product-container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing & Inventory
          </button>
          <button
            className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
          <button
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button
            className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'pricing' && renderPricingInventory()}
          {activeTab === 'images' && renderImages()}
          {activeTab === 'features' && renderFeatures()}
          {activeTab === 'seo' && renderSEO()}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard/products')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.price || !formData.stock}
              className="submit-btn"
            >
              {loading ? 'Creating Product...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
