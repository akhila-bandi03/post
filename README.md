# FeedConnect 📡 — Full Stack MERN Social Post Application

FeedConnect is a modern, responsive full-stack social posting platform built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js). It enables users to register, log in, publish rich posts (text, image, or text + image), interact with posts through likes and comments in real-time, and browse a public chronological feed with pagination.

---

## 🚀 Live Demo & Deployment
- **Frontend (Vercel)**: `https://feedconnect-app.vercel.app` *(Example)*
- **Backend (Render)**: `https://feedconnect-api.onrender.com` *(Example)*

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **React Router DOM** (Client-side routing & auth route guards)
- **Axios** (HTTP client with JWT request interceptors)
- **Vanilla CSS** (Custom responsive design system — **No Tailwind CSS**)

### Backend
- **Node.js & Express.js** (REST API architecture)
- **MongoDB Atlas & Mongoose** (Database ORM)
- **JWT (JSON Web Tokens)** (Authentication & Authorization)
- **bcryptjs** (Password hashing)
- **Multer & Cloudinary** (Image storage and delivery)
- **CORS & Dotenv** (Security & configuration)

---

## 🗄️ Database Schema (Exact 2 Collections)

FeedConnect strictly utilizes **two** collections in MongoDB Atlas:

### 1. `users` Collection
```json
{
  "_id": "ObjectId",
  "username": "String (required, min 3 chars, trim)",
  "email": "String (required, unique, lowercase, trim)",
  "password": "String (hashed with bcryptjs)",
  "createdAt": "Date (default: Date.now)"
}
```

### 2. `posts` Collection
```json
{
  "_id": "ObjectId",
  "user": {
    "userId": "ObjectId (ref: User)",
    "username": "String"
  },
  "content": "String (optional if image provided)",
  "image": "String (Cloudinary URL / CDN URL)",
  "likes": [
    {
      "userId": "ObjectId (ref: User)",
      "username": "String"
    }
  ],
  "comments": [
    {
      "userId": "ObjectId (ref: User)",
      "username": "String",
      "text": "String",
      "createdAt": "Date"
    }
  ],
  "createdAt": "Date (default: Date.now)"
}
```

> **Note**: Likes and comments are embedded documents directly within the `posts` collection, preventing unnecessary database joins and extra collections.

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/api/auth/signup` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | ❌ No |

### Post Routes (`/api/posts`)
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/api/posts?page=1&limit=10` | Get chronological feed with pagination | ❌ No |
| `POST` | `/api/posts` | Create new post (text / image / both) | ✅ Yes (JWT) |
| `POST` | `/api/posts/:id/like` | Toggle like/unlike (1 like per user) | ✅ Yes (JWT) |
| `POST` | `/api/posts/:id/comment` | Add comment to post | ✅ Yes (JWT) |

---

## 📂 Project Structure

```text
FeedConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── CommentSection.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Feed.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas cluster URL
- Cloudinary Account (for image uploads)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5002
DB_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:5002
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```

Start Vite dev server:
```bash
npm run dev
# Frontend will run on http://localhost:3002
```

---

## 🚀 Deployment Guide

### 1. Deploy Backend to Render
1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Set the **Build Command** to `npm install`.
6. Set the **Start Command** to `node server.js`.
7. Add your Environment Variables in Render:
   - `DB_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
8. Click **Deploy Web Service**.

### 2. Deploy Frontend to Vercel
1. Log into [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com/api`
8. Click **Deploy**.

---

## 🛡️ Security Best Practices Implemented
- Passwords salted and hashed with **bcryptjs** (10 salt rounds).
- JWT signed with secret expiration to guard protected routes.
- Sanitized user objects returned from API (passwords never exposed).
- `.env` excluded from version control via `.gitignore`.
- Full input validation across client and server tiers.
