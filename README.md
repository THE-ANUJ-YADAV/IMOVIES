# 🎬 IMovies — Full-Stack Movie Ticket Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6+-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC.svg)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101.svg)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://mongoosejs.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20Passed-22C55E.svg)](https://vitest.dev/)

**IMovies** is a complete, production-oriented online cinema ticket booking platform designed with a high-end dark cinematic user experience. It features real-time seat availability synchronization via Socket.IO, atomic seat hold safeguards against double booking, Razorpay test mode payment integration, QR-code digital ticket generation, customer booking management, and a dedicated Cinema Management Admin Dashboard.

---

## 🎨 1. Brand Identity & Design System

The application strictly implements the IMovies signature cinematic design palette:

| Color | Hex | Role in Application |
|---|---|---|
| **Jet Black** | `#0A0A0A` | Main page background, Navbar, Footer, cinematic viewports, dashboard background |
| **Cerulean Blue** | `#007BA7` | Primary buttons, booking CTAs, active navigation indicators, links, selected seats, progress indicators |
| **Neon Rose** | `#FF2D95` | Brand logo highlight, featured movie badges, special offers, luxury recliner indicators, subtle decorative accents |
| **Supporting Surfaces** | `#141414` / `#1A1A1A` | Card surfaces and elevated popups |
| **Border Tokens** | `#262626` | Subtle separators and glassmorphism borders |

---

## 🏗️ 2. Architecture & Directory Structure

```
imovies/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Navbar, Footer, AdminLayout
│   │   │   ├── common/        # ProtectedRoute, AdminRoute
│   │   │   ├── movies/        # MovieCard, ShowtimeSelector, TrailerModal
│   │   │   ├── seats/         # SeatMap with curved cinema screen perspective
│   │   │   └── booking/       # DigitalTicket with scannable QR pass
│   │   ├── pages/             # Route pages
│   │   │   ├── admin/         # AdminDashboard, Movies, Theatres, Shows, Bookings, Users
│   │   │   ├── HomePage.jsx
│   │   │   ├── MoviesPage.jsx
│   │   │   ├── MovieDetailsPage.jsx
│   │   │   ├── TheatresPage.jsx
│   │   │   ├── TheatreDetailsPage.jsx
│   │   │   ├── SeatSelectionPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── BookingSuccessPage.jsx
│   │   │   ├── BookingFailedPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AuthPages (Login, Register, ForgotPassword)
│   │   ├── services/          # Centralized Axios API client & Socket.IO singleton
│   │   ├── store/             # Redux Toolkit (Auth, City, Booking slices)
│   │   ├── index.css          # Tailwind CSS design tokens & custom scrollbars
│   │   └── App.jsx            # React Router v6 tree
├── server/                    # Node.js + Express + Socket.IO Backend
│   ├── src/
│   │   ├── config/            # Environment parsing & MongoDB connection (with in-memory fallback)
│   │   ├── controllers/       # Auth, Movie, Theatre, Show, Booking, Payment, Admin controllers
│   │   ├── middleware/        # JWT authentication, role authorization, errorHandler, Zod validate
│   │   ├── models/            # User, Movie, Theatre, Screen, Show, SeatHold, Booking, Payment
│   │   ├── routes/            # REST API endpoints under /api/v1
│   │   ├── services/          # Hold cleaner background interval monitor
│   │   ├── sockets/           # Real-time room management and event broadcast
│   │   ├── utils/             # Logger, API response helper, JWT tokens
│   │   ├── app.js             # Express application setup, Helmet, CORS, RateLimit
│   │   └── server.js          # HTTP server bootstrap & Socket.IO attach
│   ├── scripts/
│   │   ├── seed.js            # Rich demo data seeder (Movies, Theatres, Shows, Users)
│   │   └── createAdmin.js     # Standalone administrator creator
│   └── tests/
│       └── api.test.js        # Vitest + Supertest comprehensive end-to-end test suite
├── package.json               # Orchestration scripts
├── .gitignore
└── README.md
```

---

## ⚡ 3. Key Capabilities

### Customer Experience
- **Cinematic Discovery**: Featured backdrop banner, trailer player modal, genre filters, and language chips.
- **Location Awareness**: Multi-city switcher (Mumbai, Delhi, Bengaluru, Hyderabad).
- **Movie & Theatre Listings**: Rich detail views, cast & crew, format badges (IMAX 2D, 2D, 3D, 4DX).
- **Curved Cinema Seating**: Interactive cinema map with Standard, Premium, and Recliner luxury tiers.
- **Real-Time Seat Map**: Live Socket.IO synchronization prevents double viewing confusion; seats selected by others update instantly.
- **Server-Enforced Temporary Holds**: 10-minute countdown hold with atomic database safeguards.
- **Payment & Checkout**: Seamless Razorpay test mode integration with sandbox simulator fallback.
- **Instant Digital QR Pass**: Generated on confirmation with non-sensitive reference tokens, print-friendly layout.
- **User Dashboard**: Track upcoming, past, and cancelled tickets with a 2-hour pre-show cancellation policy.

### Cinema Management Dashboard (`/admin`)
- **Key Metrics Overview**: Real-time revenue, bookings count, active titles, and average cinema occupancy.
- **Visual Recharts**: 7-day revenue trend area chart and film library catalog distribution by genre.
- **Catalog Management**: Add, update, or archive films with posters, backdrops, and formats.
- **Theatre & Auditorium Configurator**: Configure screen layouts and custom seat matrices.
- **Show Scheduling**: Schedule showtimes with automated collision detection to prevent auditorium double-booking.
- **Booking Auditing & Customer Management**: Search references, filter statuses, view transaction breakdowns, and manage user accounts.

---

## 🚀 4. Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [npm](https://www.npmjs.com) (v9 or higher)
- Optional: MongoDB instance (if not present, the development server automatically initializes an embedded in-memory MongoDB instance for 100% zero-configuration startup).

### Step 1: Install Dependencies
From the repository root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Environment Configuration
Environment files are already provided. You can customize them if needed:
- `server/.env`:
  ```env
  PORT=5000
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173
  MONGODB_URI=mongodb://127.0.0.1:27017/imovies
  JWT_SECRET=imovies_super_secret_jwt_key_2026_cinematic_experience
  RAZORPAY_KEY_ID=rzp_test_imoviesDemoKey123
  RAZORPAY_KEY_SECRET=imoviesTestSecretKeyDemo987
  ADMIN_EMAIL=admin@imovies.com
  ADMIN_PASSWORD=Admin@123456
  SEAT_HOLD_DURATION_SECONDS=600
  ```
- `client/.env`:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api/v1
  VITE_SOCKET_URL=http://localhost:5000
  VITE_RAZORPAY_KEY_ID=rzp_test_imoviesDemoKey123
  ```

### Step 3: Populate Demo Seed Data
Run the automated seed script to populate realistic movies, auditoriums, upcoming shows, and accounts:
```bash
cd server
npm run seed
```

#### Default Credentials:
- **Administrator**: `admin@imovies.com` / `Admin@123456`
- **Standard Member**: `user@imovies.com` / `User@123456`
*(Both quick-login buttons are also conveniently embedded directly on the Login page!)*

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend API & Socket.IO):**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 5. Automated Testing

The backend includes comprehensive test coverage using **Vitest** and **Supertest**:
- Authentication and password hashing
- Role-based authorization controls
- Movie & Theatre CRUD operations
- Show scheduling collision prevention
- Real-time seat hold acquisition & hold expiration
- Concurrency conflict handling (double booking rejection)
- Razorpay HMAC-SHA256 signature verification & idempotent confirmations
- 2-hour cancellation policy validation

To run the automated test suite:
```bash
cd server
npm test
```
*All 18 automated test suites execute and pass.*

---

## 🔒 6. Concurrency & Security Architecture

1. **Atomic Seat Allocation**:
   When finalizing a booking, the backend issues an atomic update:
   ```javascript
   await Show.findOneAndUpdate(
     { _id: showId, bookedSeats: { $nin: requestedSeats } },
     { $addToSet: { bookedSeats: { $each: requestedSeats } } }
   );
   ```
   If any seat was acquired by another transaction in that millisecond window, the operation safely aborts and triggers refund recovery.
2. **Temporary Seat Holds**:
   Holds are registered in `SeatHold` with an expiration timestamp (`expiresAt`). An automated background cleaner (`holdCleaner.js`) periodically sweeps stale holds and broadcasts `seat-released` events across Socket.IO.
3. **Idempotent Payment Callbacks**:
   Payment verification verifies `providerOrderId` and existing booking states; redundant webhook or frontend callback calls will not duplicate confirmed seats.
4. **Hardened HTTP Pipeline**:
   - `helmet` protection headers
   - `express-rate-limit` on authentication endpoints
   - Strict CORS policy restricting requests to trusted frontend origins
   - Zod request schema validation on incoming request payloads

---

## 🌐 7. REST API Documentation Overview

All API endpoints are versioned under `/api/v1`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT | No |
| `GET` | `/api/v1/auth/me` | Fetch active user profile | Yes |
| `GET` | `/api/v1/movies` | Filter and search movies | No |
| `GET` | `/api/v1/movies/:id` | Get movie details & showtimes | No |
| `GET` | `/api/v1/theatres` | List theatres by city | No |
| `GET` | `/api/v1/shows/:id/seats`| Retrieve seat layout & real-time states | No |
| `POST` | `/api/v1/shows/:id/holds`| Reserve temporary seat hold | Yes |
| `POST` | `/api/v1/bookings` | Create pending booking record | Yes |
| `GET` | `/api/v1/bookings/my` | View customer booking history | Yes |
| `POST` | `/api/v1/bookings/:id/cancel`| Cancel booking and release seats | Yes |
| `POST` | `/api/v1/payments/create-order` | Initialize payment order | Yes |
| `POST` | `/api/v1/payments/verify` | Verify payment signature & finalize booking | Yes |
| `GET` | `/api/v1/admin/dashboard` | Cinema analytics & KPIs | Admin |
| `GET` | `/api/v1/admin/analytics` | Recharts financial & genre trends | Admin |

---

## 🚢 8. Production Deployment Guide

### Frontend Deployment (e.g. Vercel / Netlify)
1. Build the production package: `npm run build` inside `client/`.
2. Configure Environment Variables in the hosting dashboard:
   - `VITE_API_BASE_URL`: `https://your-api.onrender.com/api/v1`
   - `VITE_SOCKET_URL`: `https://your-api.onrender.com`
   - `VITE_RAZORPAY_KEY_ID`: `your_live_or_test_key`

### Backend Deployment (e.g. Render / Railway / AWS)
1. Set the root directory to `server/` with build command `npm install` and start command `npm start`.
2. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies`
   - `JWT_SECRET`: Random 64-char string
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`

---

## 📄 License
This project is licensed under the MIT License.
