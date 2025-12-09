# 🏪 Vendor Management Portal

A full-stack vendor management system with registration, product showcase, and client rating features.

## 🚀 Live Deployment

**Frontend:** [https://your-site.netlify.app](https://your-site.netlify.app)  
**Backend API:** [https://vendor-portal-api.onrender.com](https://vendor-portal-api.onrender.com)  
**GitHub:** [https://github.com/yourusername/vendor-management-portal](https://github.com/yourusername/vendor-management-portal)

## 📋 Features

### ✅ Complete Requirements
- **Vendor Registration** with form validation & password hashing
- **Vendor Dashboard** with profile & product management
- **Public Vendor Profiles** with unique URLs
- **Product Showcase** with image upload
- **Vendor Listing** with search, filter, sort
- **Client Feedback System** with 5-star ratings
- **Admin Panel** with vendor statistics

### 🎨 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Auth:** JWT, bcrypt
- **File Upload:** Multer
- **Deployment:** Render (Backend), Netlify (Frontend)

## 🛠️ Quick Start

### 1. Local Development
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Add your DB credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Database Setup
```sql
CREATE DATABASE vendor_portal;
psql -U postgres -d vendor_portal -f backend/database.sql
```

### 3. Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 📁 Project Structure
```
vendor-portal/
├── frontend/          # React app (Netlify)
│   ├── src/pages/    # All UI pages
│   ├── src/components/# Reusable components
│   └── vite.config.js
├── backend/           # Node.js API (Render)
│   ├── src/routes/   # API endpoints
│   ├── src/models/   # Database models
│   ├── uploads/      # Image storage
│   └── server.js
└── database.sql      # PostgreSQL schema
```

## 🔗 API Endpoints
```
POST   /api/auth/register    # Vendor registration
POST   /api/auth/login       # Vendor login
GET    /api/vendors          # List vendors (with filters)
POST   /api/products         # Add product (protected)
POST   /api/reviews/{id}     # Submit review
GET    /api/admin/vendors    # Admin view
```

## 🚀 Deployment Guide

### 1. Backend on Render
1. Create **Web Service** on Render
2. Connect GitHub repository
3. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret
   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
   ```
4. Build: `npm install`
5. Start: `npm start`

### 2. Database on Render
1. Create **PostgreSQL** instance
2. Use credentials in backend env vars
3. Run `database.sql` in Render SQL editor

### 3. Frontend on Netlify
1. Import Git repository
2. Build settings:
   - Build: `cd frontend && npm run build`
   - Publish: `frontend/dist`
3. Environment variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com/api
   ```

## 🔐 Security Features
- JWT token authentication
- Password hashing with bcrypt
- SQL injection prevention
- File upload validation
- Protected API routes

## 📱 Pages
1. **Home** - Feature overview & category browsing
2. **Register/Login** - Vendor authentication
3. **Vendor Dashboard** - Profile & product management
4. **Vendor Listing** - Search & filter all vendors
5. **Vendor Profile** - Public showcase page
6. **Feedback Page** - Submit reviews
7. **Admin Panel** - View all vendors & stats

## 🧪 Testing Features
1. Register multiple vendors
2. Add products with images
3. Submit reviews with ratings
4. Filter vendors by category
5. Test admin panel without login

## ⚡ Performance
- Database indexing
- Connection pooling
- Code splitting
- Image optimization
- Responsive design



*Deployed on Render + Netlify | PostgreSQL Database | Full-stack React/Node.js*