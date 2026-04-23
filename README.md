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
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Author](#-author)

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

### ✔️ Completed

- [x] Folder structure & project setup
- [x] MongoDB database connection
- [x] User model (schema design)
- [x] Sign Up & Login endpoints
- [x] Async error handler utility (`asyncHandler`)
- [x] Global error handling middleware
- [x] Uniform success/error API response structure (`response.js`)
- [x] Environment variables setup (`dotenv`)

<details>
<summary><strong>🛠️ asyncHandler + successResponse + globalErrorHandling</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      error.cause = 500;
      return next(error);
    });
  };
};

export const successResponse = ({
  res,
  message = "Done",
  status = 200,
  data,
}) => {
  return res.status(status).json({ message, data });
};

export const globalErrorHandling = (error, req, res, next) => {
  return res
    .status(error.cause || 400)
    .json({ err_message: error.message, stack: error.stack });
};
```

</details>

- [x] DB Service layer — generalized ODM-agnostic data access methods

<details>
<summary><strong>🗄️ DB Service</strong> — <em>Click to see example</em></summary>

<br/>

```javascript
export const findOne = async ({
  model,
  filter = {},
  projection = {},
  populate = [],
} = {}) => {
  return await model.findOne(filter, projection).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};
```

</details>

- [x] Hashing — `bcrypt` implementation for passwords (`src/utils/security/hash.security.js`)

<details>
<summary><strong>🔒 Hashing — bcrypt</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import bcrypt from "bcryptjs";

export const generateHash = async ({ plainText = "", salt = 12 }) => {
  const hash = bcrypt.hashSync(plainText, parseInt(salt));
  return hash;
};

export const compareHash = async ({ plainText = "", hashedPassword = "" }) => {
  const match = bcrypt.compareSync(plainText, hashedPassword);
  return match;
};
```

</details>

---

### 🔜 In Progress / Upcoming

- [ ] Encryption — Symmetric vs Asymmetric (`crypto-js`)
- [ ] Implement encryption on sensitive fields (phone numbers)
- [ ] Tokens — what they are & why we need them
- [ ] Generate Access & Refresh tokens (`jsonwebtoken`)
- [ ] Verify token middleware
- [ ] Authentication middleware (protect routes)
- [ ] OTP email verification (`nodemailer`)
- [ ] Rate limiting per IP (`express-rate-limit`)
- [ ] Helmet security headers
- [ ] CORS configuration
- [ ] Joi request validation on all routes
- [ ] Multer file upload handling
- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Public profile page per user
- [ ] Block/report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard (future)

---

## 🗂️ Project Structure

```
SARAHAA-APP/
├── src/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   └── auth.routes.js
│   ├── DB/
│   │   ├── models/
│   │   │   └── user.model.js
│   │   ├── db.service.js      (generalized ODM-agnostic methods)
│   │   └── connection.js
│   ├── user/
│   │   └── ⬜ add user files here as you build
│   └── utils/
│   │   ├── response.js        (asyncHandler + success/error helpers + Global Error Handling)
│   ├── app.controller.js  (main app setup / route mounting)
│   └── index.js           (entry point)
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 📖 API Documentation

> Base URL: `http://localhost:5000`

---

## 🔑 Auth — `/auth`

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/signup</strong> — Register a new user</summary>

<br/>

**Request Body:**
```json
{
  "fullName": "Ahmed Essam",
  "email": "a1@example.com",
  "password": "1234",
  "gender": "male",
  "phone": "01234567891"
}
```

**Response `201` — Success:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "...",
    "fullName": "Ahmed Essam",
    "email": "a1@example.com",
    "gender": "male",
    "phone": "01234567891"
  }
}
```

**Response `409` — Email already exists:**
```json
{
  "message": "Email already exists"
}
```

> ⬜ *Add more error cases here as you implement validation (e.g. missing fields, invalid email format)*

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/login</strong> — Login with credentials</summary>

<br/>

**Request Body:**
```json
{
  "email": "a1@example.com",
  "password": "1234"
}
```

**Response `200` — Success:**
```json
{
  "message": "User Logged in successfully",
  "user": {
    "_id": "...",
    "fullName": "Ahmed Essam",
    "email": "a1@example.com"
  }
}
```

**Response `404` — Invalid Email or Password:**
```json
{
  "message": "Invalid Email or Password"
}
```

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/verify-otp</strong> — Verify email with OTP &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add request body, success response, and error cases when implemented*

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/resend-otp</strong> — Resend OTP to email &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add details when implemented*

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/forgot-password</strong> — Send password reset email &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add details when implemented*

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/reset-password</strong> — Reset password using token &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add details when implemented*

</details>

---

## 👤 User — `/users` &nbsp; 🔒 *Protected*

<details>
<summary><code>GET</code> &nbsp; <strong>/users/me</strong> — Get current user profile &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add request, success response, and error cases when implemented*

</details>

---

<details>
<summary><code>PUT</code> &nbsp; <strong>/users/me</strong> — Update profile (username, bio, avatar) &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add details when implemented*

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/users/:username</strong> — Get public profile by username &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Used to display the user's anonymous link page*  
> ⬜ *Add details when implemented*

</details>

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer  
📩 ahmedezsam@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221) ·

---

<div align="center">
<sub>Built with focus, coffee, and clean architecture principles ☕</sub>
</div>
