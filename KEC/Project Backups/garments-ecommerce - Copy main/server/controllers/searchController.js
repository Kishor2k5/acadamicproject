const Product = require('../models/Product');

// Advanced search with filters
const searchProducts = async (req, res) => {
  try {
    const {
      q,           // search query
      category,    // category filter
      minPrice,    // minimum price
      maxPrice,    // maximum price
      brand,       // brand filter
      size,        // size filter
      color,       // color filter
      rating,      // minimum rating
      inStock,     // only in stock items
      sortBy,      // sort field
      sortOrder,   // asc or desc
      page = 1,    // page number
      limit = 12   // items per page
    } = req.query;

    // Build search query
    let searchQuery = { isActive: true };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Category filter
    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      searchQuery.brand = { $regex: brand, $options: 'i' };
    }

    // Size filter
    if (size) {
      searchQuery.sizes = { $in: [size] };
    }

    // Color filter
    if (color) {
      searchQuery.colors = { $in: [color] };
    }

    // Rating filter
    if (rating) {
      searchQuery.rating = { $gte: parseFloat(rating) };
    }

    // Stock filter
    if (inStock === 'true') {
      searchQuery.stock = { $gt: 0 };
    }

    // Build sort options
    let sortOptions = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'price':
          sortOptions.price = order;
          break;
        case 'rating':
          sortOptions.rating = order;
          break;
        case 'name':
          sortOptions.name = order;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'popular':
          sortOptions.numReviews = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      // Default sort by relevance if text search, otherwise by newest
      if (q) {
        sortOptions = { score: { $meta: 'textScore' } };
      } else {
        sortOptions.createdAt = -1;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const products = await Product.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for performance

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Get filter options for frontend
    const filterOptions = await getFilterOptions();

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: filterOptions,
        searchQuery: q || '',
        appliedFilters: {
          category,
          minPrice,
          maxPrice,
          brand,
          size,
          color,
          rating,
          inStock
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get product name suggestions
    const productSuggestions = await Product.find({
      isActive: true,
      name: { $regex: q, $options: 'i' }
    })
    .select('name')
    .limit(5);

    // Get category suggestions
    const categorySuggestions = await Product.distinct('category', {
      isActive: true,
      category: { $regex: q, $options: 'i' }
    });

    // Get brand suggestions
    const brandSuggestions = await Product.distinct('brand', {
      isActive: true,
      brand: { $regex: q, $options: 'i' }
    });

    const suggestions = [
      ...productSuggestions.map(p => ({ type: 'product', value: p.name })),
      ...categorySuggestions.map(c => ({ type: 'category', value: c })),
      ...brandSuggestions.map(b => ({ type: 'brand', value: b }))
    ].slice(0, 10);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

// Get filter options for frontend
const getFilterOptions = async () => {
  try {
    const [categories, brands, sizes, colors, priceRange] = await Promise.all([
      Product.distinct('category', { isActive: true }),
      Product.distinct('brand', { isActive: true, brand: { $ne: null } }),
      Product.distinct('sizes', { isActive: true }),
      Product.distinct('colors', { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
      ])
    ]);

    return {
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      sizes: sizes.flat().filter(Boolean),
      colors: colors.flat().filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
    };
  } catch (error) {
    console.error('Filter options error:', error);
    return {
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      priceRange: { minPrice: 0, maxPrice: 1000 }
    };
  }
};

// Get popular searches
const getPopularSearches = async (req, res) => {
  try {
    // This would typically come from a search analytics collection
    // For now, return popular categories and products
    const popularCategories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const popularProducts = await Product.find({ isActive: true })
      .sort({ numReviews: -1, rating: -1 })
      .select('name')
      .limit(5);

    const popularSearches = [
      ...popularCategories.map(c => c._id),
      ...popularProducts.map(p => p.name)
    ];

    res.status(200).json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches',
      error: error.message
    });
  }
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
  getFilterOptions,
  getPopularSearches
};
