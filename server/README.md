# G Fresh E-commerce Backend

A modern e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 User authentication and authorization
- 🛍️ Product management with categories and brands
- 🛒 Shopping cart functionality
- 💳 Coupon and discount system
- 📝 Product reviews and ratings
- 🖼️ Image upload support
- 🔍 Advanced search and filtering
- 📊 Admin dashboard capabilities

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Mongoose validation
- **Security**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garments-ecommerce/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/g_fresh
   JWT_SECRET=your_super_secret_key_here
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/brands` - Get all brands
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon

## Database Schema

### User
- name, email, password
- role (user/admin)
- address, phone, avatar
- isActive, emailVerified

### Product
- name, description, price, originalPrice
- category, subcategory, brand
- images, colors, sizes, stock
- rating, reviews, isFeatured
- specifications, tags

### Cart
- user, items
- subtotal, taxAmount, shippingAmount
- totalAmount, couponCode, discountAmount

### Order
- user, orderNumber, items
- shippingAddress, billingAddress
- paymentMethod, status, paymentStatus
- subtotal, taxAmount, shippingAmount, totalAmount

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/g_fresh |
| `JWT_SECRET` | JWT secret key | g_fresh_secret_key |
| `MAX_FILE_SIZE` | Max file upload size | 5242880 (5MB) |

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure MongoDB Atlas or production MongoDB
4. Set up proper CORS origins
5. Configure file upload storage (consider cloud storage)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@gfresh.com or create an issue in the repository. 