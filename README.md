<div align="center">

<h1>🕵️ Sarahaa App</h1>
<p><strong>Anonymous Messaging App — REST API Backend</strong></p>

![Status](https://img.shields.io/badge/Status-In_Progress-f59e0b?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<br/>

> A secure, scalable backend system for an anonymous social messaging platform.  
> Users can send and receive anonymous messages with full auth, privacy controls, and hardened API security.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack & Packages](#-tech-stack--packages)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Progress Log](#-progress-log)

---

## 🧠 Overview

Sarahaa is an anonymous messaging platform where users share a public link and receive messages from anyone — without the sender revealing their identity. This repository contains the **full backend API** built with Node.js and Express.js, featuring a security-first architecture.

**Core concepts:**
- Users register and get a personal public link
- Anyone (logged in or not) can send an anonymous message to a user via that link
- Users can view, manage, and reply to their messages (reply is visible to all, sender stays anonymous)
- Full auth system with email OTP verification

---

## ✅ Features

- [x] User registration & login with JWT authentication
- [x] OTP email verification via Nodemailer
- [x] Bcrypt password hashing
- [x] Encrypted sensitive fields (phone numbers) using crypto-js
- [x] Helmet security headers
- [x] Rate limiting per IP
- [x] CORS configuration
- [x] Centralized async error handling middleware
- [x] Uniform success/error API response structure
- [x] Joi request validation on all routes
- [x] Multer file upload handling
- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Public profile page per user
- [ ] Block/report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard (future)

---

## 🛠️ Tech Stack & Packages

### Runtime & Framework
`node` · `express`

### Database
`mongodb` · `mongoose`

### Authentication & Security
`jsonwebtoken` · `bcrypt` · `helmet` · `express-rate-limit` · `cors` · `crypto-js`

### Validation & Files
`joi` · `multer`

### Email
`nodemailer`

### Config & Utilities
`dotenv` · `morgan` · `http-status-codes`

### Dev Dependencies
`nodemon`

### Deployment
> ⬜ *Add when deployed (e.g. Railway, Render, VPS, Docker...)*

### Additional Packages & Third-party
> ⬜ *Add any new packages here as the project grows*

---

## 🗂️ Project Structure

```
sarahaa/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── mail.js             # Nodemailer transporter config
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── error.middleware.js # Global error handler
│   │   └── validate.js         # Joi validation wrapper
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── user/
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   └── user.validation.js
│   │   └── message/
│   │       ├── message.routes.js
│   │       ├── message.controller.js
│   │       ├── message.service.js
│   │       └── message.validation.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── message.model.js
│   ├── utils/
│   │   ├── apiResponse.js      # Uniform response wrapper
│   │   ├── asyncHandler.js     # Async error catch wrapper
│   │   ├── encrypt.js          # crypto-js helpers
│   │   └── sendOTP.js          # OTP email sender
│   └── app.js                  # Express app setup
├── .env.example
├── .gitignore
├── package.json
└── server.js                   # Entry point
```

---

## 🔐 Environment Variables

Create a `.env` file in the root based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sarahaa

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Encryption
CRYPTO_SECRET=your_crypto_secret_key
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/ahmedezsam2333/sarahaa.git
cd sarahaa

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Run in development
npm run dev

# 5. Run in production
npm start
```

---

## 📖 API Documentation

> Base URL: `http://localhost:3000/api/v1`

---

### 🔑 Auth Routes — `/auth`

#### `POST /auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "ahmed",
  "email": "ahmed@example.com",
  "password": "StrongPass123!",
  "phone": "01011847804"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email.",
  "data": {
    "userId": "abc123"
  }
}
```

---

#### `POST /auth/verify-otp`
Verify email with OTP code.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "otp": "482910"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "token": "<JWT>"
  }
}
```

---

#### `POST /auth/login`
Login with credentials.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "StrongPass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "<JWT>",
    "user": { "id": "...", "username": "ahmed" }
  }
}
```

---

#### `POST /auth/resend-otp`
Resend OTP to email.

> ⬜ *Add details when implemented*

---

#### `POST /auth/forgot-password`
Send password reset email.

> ⬜ *Add details when implemented*

---

#### `POST /auth/reset-password`
Reset password using token.

> ⬜ *Add details when implemented*

---

### 👤 User Routes — `/users` &nbsp; 🔒 *Protected*

#### `GET /users/me`
Get current authenticated user profile.

> ⬜ *Add details when implemented*

---

#### `PUT /users/me`
Update profile info (username, bio, avatar).

> ⬜ *Add details when implemented*

---

#### `GET /users/:username`
Get a user's public profile by username (used to show the anonymous link page).

> ⬜ *Add details when implemented*

---

### 💬 Message Routes — `/messages`

#### `POST /messages/:username` &nbsp; 🔓 *Public*
Send an anonymous message to a user.

> ⬜ *Add details when implemented*

---

#### `GET /messages/inbox` &nbsp; 🔒 *Protected*
Get all received messages for the logged-in user.

> ⬜ *Add details when implemented*

---

#### `DELETE /messages/:id` &nbsp; 🔒 *Protected*
Delete a message from inbox.

> ⬜ *Add details when implemented*

---

#### `POST /messages/:id/reply` &nbsp; 🔒 *Protected*
Reply to a message publicly.

> ⬜ *Add details when implemented*

---

## 📅 Progress Log

> Updated as features are completed.

| Date | What was done |
|---|---|
| — | Project scaffolding & folder structure |
| — | MongoDB connection & app setup |
| — | User model & auth module (register, login, OTP) |
| — | JWT middleware & Joi validation layer |
| — | Helmet, CORS, rate limiting configuration |
| — | Multer file upload + crypto-js encryption |
| ⬜ | Message module — send anonymous message |
| ⬜ | Message module — inbox CRUD |
| ⬜ | User public profile route |
| ⬜ | Pagination on inbox |

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer  
📩 ahmedezsam@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221) · [GitHub](https://github.com/ahmedezsam2333)

---

<div align="center">
<sub>Built with focus, coffee, and clean architecture principles ☕</sub>
</div>
