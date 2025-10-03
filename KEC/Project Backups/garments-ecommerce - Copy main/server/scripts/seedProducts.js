require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

// Mirror of client sample products (client/src/pages/Products.js)
const sampleProducts = [
  // Existing products
  {
    id: 1,
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with breathable fabric.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'shirts',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Classic Denim Jeans',
    description: 'High-quality denim jeans with perfect fit and durability. Premium stretch denim for all-day comfort.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'pants',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Casual Hoodie',
    description: 'Warm and comfortable hoodie for cool weather. Perfect for casual outings and weekend relaxation.',
    price: 59.99,
    originalPrice: 74.99,
    category: 'hoodies',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
  },
  {
    id: 5,
    name: 'Formal Dress Shirt',
    description: 'Professional dress shirt for business meetings and formal events',
    price: 89.99,
    category: 'shirts',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Slim Fit Chinos',
    description: 'Modern slim-fit chinos for a contemporary look',
    price: 69.99,
    category: 'pants',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
  },
  {
    id: 7,
    name: 'Summer Dress',
    description: 'Light and breezy summer dress perfect for warm days',
    price: 89.99,
    category: 'dresses',
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
  },
  {
    id: 8,
    name: 'Leather Jacket',
    description: 'Stylish leather jacket for a bold and confident look',
    price: 199.99,
    category: 'jackets',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  },
  {
    id: 9,
    name: 'Winter Sweater',
    description: 'Cozy winter sweater to keep you warm and stylish',
    price: 74.99,
    category: 'sweaters',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
  },
  {
    id: 10,
    name: 'Business Suit',
    description: 'Professional business suit for important meetings',
    price: 299.99,
    category: 'suits',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
  },
  
  // New Products
  {
    id: 11,
    name: 'Athletic Jogger Pants',
    description: 'Comfortable and stylish jogger pants for both workouts and casual wear',
    price: 49.99,
    originalPrice: 69.99,
    category: 'pants',
    image_url: 'https://images.unsplash.com/photo-1542272605-7c4a503f0af9?w=400&h=400&fit=crop',
  },
  {
    id: 12,
    name: 'Floral Summer Dress',
    description: 'Beautiful floral print dress perfect for summer outings and beach vacations',
    price: 65.99,
    originalPrice: 79.99,
    category: 'dresses',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
  },
  {
    id: 13,
    name: 'Casual Button-Down Shirt',
    description: 'Versatile button-down shirt that can be dressed up or down for any occasion',
    price: 45.99,
    category: 'shirts',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=400&fit=crop',
  },
  {
    id: 14,
    name: 'Slim Fit Blazer',
    description: 'Elegant slim-fit blazer for a polished and professional look',
    price: 129.99,
    category: 'jackets',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
  },
  {
    id: 15,
    name: 'Knit Cardigan',
    description: 'Lightweight knit cardigan perfect for layering in any season',
    price: 54.99,
    category: 'sweaters',
    image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=400&fit=crop',
  },
  {
    id: 16,
    name: 'Running Shoes',
    description: 'High-performance running shoes with superior cushioning and support',
    price: 89.99,
    originalPrice: 119.99,
    category: 'shoes',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  },
  {
    id: 17,
    name: 'Yoga Pants',
    description: 'Comfortable and stretchy yoga pants for your workout sessions',
    price: 39.99,
    category: 'sports',
    image_url: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&h=400&fit=crop',
  },
  {
    id: 18,
    name: 'Denim Jacket',
    description: 'Classic denim jacket for a timeless casual look',
    price: 79.99,
    category: 'jackets',
    image_url: 'https://images.unsplash.com/photo-1551028719-0c7de8a6bc2b?w=400&h=400&fit=crop',
  },
  {
    id: 19,
    name: 'Polo Shirt',
    description: 'Classic polo shirt for a smart casual look',
    price: 34.99,
    category: 'shirts',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
  },
  {
    id: 20,
    name: 'Wool Coat',
    description: 'Warm and stylish wool coat for cold winter days',
    price: 199.99,
    originalPrice: 249.99,
    category: 'jackets',
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e4?w=400&h=400&fit=crop',
  },
];

function toProductDoc(p) {
  return {
    name: p.name,
    description: p.description || 'No description',
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    subcategory: '',
    brand: 'G Fresh',
    images: [p.image_url],
    colors: ['Black', 'Blue', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    sku: `SKU-${p.id}`,
    material: 'Cotton',
    care: 'Machine wash cold',
    features: [],
    specifications: {},
    isActive: true,
    isFeatured: false,
    tags: ['sample'],
  };
}

async function cleanupProducts() {
  await connectDB();
  
  // Delete all products with SKUs starting with 'SKU-'
  const result = await Product.deleteMany({ sku: /^SKU-\d+$/ });
  
  console.log(`[cleanup] Removed ${result.deletedCount} products`);
  await mongoose.connection.close();
  console.log('[cleanup] Done.');
}

async function main() {
  const command = process.argv[2];
  
  if (command === '--cleanup') {
    return cleanupProducts();
  }
  
  // Default behavior: seed products
  await connectDB();

  for (const p of sampleProducts) {
    const doc = toProductDoc(p);
    try {
      // Upsert by sku
      const res = await Product.findOneAndUpdate(
        { sku: doc.sku },
        { $set: doc },
        { upsert: true, new: true }
      );
      console.log(`[seed-products] Upserted: ${res.name} (SKU ${res.sku})`);
    } catch (e) {
      console.error('[seed-products] Failed:', p.name, e.message);
    }
  }

  await mongoose.connection.close();
  console.log('[seed-products] Done.');
}

main().catch(async (err) => {
  console.error('[seed-products] Unexpected error:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
