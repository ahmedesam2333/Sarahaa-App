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

export const findById = async ({
  model,
  id,
  projection = {},
  populate = [],
} = {}) => {
  return await model.findById(id, projection).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};

export const findByIdAndUpdate = async ({
  model,
  id,
  updatedData = {},
} = {}) => {
  return await model.findByIdAndUpdate(id, updatedData, { after: true });
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

- [x] Encryption — AES symmetric encryption on sensitive fields (`src/utils/security/encrypt.security.js`)

<details>
<summary><strong>🔐 Encryption — AES (crypto-js)</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import CryptoJS from "crypto-js";

export const genEncrypt = async ({
  plainText = "",
  secretKey = process.env.AES_SECRET_KEY,
}) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

export const genDecrypt = async ({
  cipherText = "",
  secretKey = process.env.AES_SECRET_KEY,
}) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
};
```

</details>

- [x] JWT — Access & Refresh token generation + verification (`src/utils/security/token.security.js`)

<details>
<summary><strong>🪙 JWT Tokens</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import jwt from "jsonwebtoken";

export const genAccessToken = async ({
  payload = {},
  signature = process.env.JWT_ACCESS_KEY,
  options = { expiresIn: "15m" },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const genRefreshToken = async ({
  payload = {},
  signature = process.env.JWT_REFRESH_KEY,
  options = { expiresIn: "1y" },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.JWT_ACCESS_KEY,
} = {}) => {
  return jwt.verify(token, signature);
};
```

</details>

- [x] Authentication middleware — verifies token & attaches user to `req.user` (`src/middleware/authentication.middleware.js`)

<details>
<summary><strong>🛡️ Authentication Middleware</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import { asyncHandler } from "../utils/response.js";
import { verifyToken } from "../utils/security/token.security.js";
import userModel from "../DB/models/user.model.js";
import * as DBService from "../DB/db.service.js";

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const decoded = await verifyToken({ token: authorization });
    if (!decoded?._id) return next(new Error("Invalid-Token", { cause: 400 }));
    const user = await DBService.findById({
      model: userModel,
      id: decoded._id,
    });
    if (!user) return next(new Error("User Not Found", { cause: 404 }));
    req.user = user;
    return next();
  });
};
```

</details>

---

### 🔜 In Progress / Upcoming

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
│   │   │   └── user.model.js          (includes refresh_token field)
│   │   ├── db.service.js              (findOne, findById, create, findByIdAndUpdate)
│   │   └── connection.js
│   ├── middleware/
│   │   └── authentication.middleware.js
│   ├── user/
│   │   ├── user.controller.js
│   │   └── user.routes.js
│   └── utils/
│   │   ├── response.js                (asyncHandler + success/error helpers + Global Error Handling)
│   │   └── security/
│   │       ├── hash.security.js       (bcrypt generateHash + compareHash)
│   │       ├── encrypt.security.js    (AES genEncrypt + genDecrypt)
│   │       └── token.security.js      (JWT genAccessToken + genRefreshToken + verifyToken)
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
  "data": {
    "access_token": "<jwt_access_token>",
    "user": {
      "_id": "...",
      "fullName": "Ahmed Essam",
      "email": "a1@example.com",
      "gender": "male",
      "phone": "<encrypted>",
      "refresh_token": "<jwt_refresh_token>"
    }
  }
}
```

**Response `409` — Email already exists:**
```json
{ "err_message": "Email already exists" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone } = req.body;
  if (await DBService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  const hashedPassword = await generateHash({ plainText: password });
  const encPhone = await genEncrypt({ plainText: phone });
  const refresh_token = await genRefreshToken({ payload: { email } });
  const user = await DBService.create({
    model: userModel,
    data: [{ fullName, email, password: hashedPassword, gender, phone: encPhone, refresh_token }],
  });
  const access_token = await genAccessToken({ payload: { _id: user._id } });
  return successResponse({ res, message: "User created successfully", status: 201, data: { access_token, user } });
});
```

</details>

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
  "data": {
    "access_token": "<jwt_access_token>"
  }
}
```

**Response `404` — Invalid email or password:**
```json
{ "err_message": "Invalid email or password" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email } });
  if (!user) return next(new Error("Invalid email or password", { cause: 404 }));
  const match = await compareHash({ plainText: password, hashedPassword: user.password });
  if (!match) return next(new Error("Invalid email or password", { cause: 404 }));
  const access_token = await genAccessToken({ payload: { _id: user._id } });
  return successResponse({ res, status: 200, message: "User Logged in successfully", data: { access_token } });
});
```

</details>

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/access_token</strong> — Get new Access & Refresh tokens using Refresh Token</summary>

<br/>

**Request Body:**
```json
{ "refreshToken": "<jwt_refresh_token>" }
```

**Response `200` — Success:**
```json
{
  "message": "Done",
  "data": {
    "access_token": "<new_jwt_access_token>",
    "refresh_token": "<new_jwt_refresh_token>"
  }
}
```

**Response `400` — Missing or invalid refresh token:**
```json
{ "err_message": "Refresh Token is required" }
```

**Response `401` — Token mismatch:**
```json
{ "err_message": "Invalid Refresh Token" }
```

**Response `404` — User not found:**
```json
{ "err_message": "User not found" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const getAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new Error("Refresh Token is required", { cause: 400 }));
  const verify = await verifyToken({ token: refreshToken, signature: process.env.JWT_REFRESH_KEY });
  if (!verify?.email) return next(new Error("Invalid Refresh Token", { cause: 400 }));
  const user = await DBService.findOne({ model: userModel, filter: { email: verify.email } });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.refresh_token !== refreshToken) return next(new Error("Invalid Refresh Token", { cause: 401 }));
  const access_token = await genAccessToken({ payload: { _id: user._id } });
  const refresh_token = await genRefreshToken({ payload: { email: user.email } });
  await DBService.findByIdAndUpdate({ model: userModel, id: user._id, updatedData: { refresh_token } });
  return successResponse({ res, status: 200, data: { access_token, refresh_token } });
});
```

</details>

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

## 👤 User — `/user` &nbsp; 🔒 *Protected*

<details>
<summary><code>GET</code> &nbsp; <strong>/user</strong> — Get current user profile</summary>

<br/>

> 🔒 Requires authentication middleware — pass `access_token` in `Authorization` header.
> 📝 *Phone is stored encrypted in DB and decrypted before being returned.*
**Headers:**
```
Authorization: <access_token>
```

**Response `200` — Success:**
```json
{
  "message": "Done",
  "data": {
    "_id": "...",
    "fullName": "Ahmed Essam",
    "email": "a1@example.com",
    "gender": "male",
    "phone": "01234567891"
  }
}
```

**Response `400` — Invalid token:**
```json
{ "err_message": "Invalid-Token" }
```

**Response `404` — User not found:**
```json
{ "err_message": "User Not Found" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = await genDecrypt({ cipherText: req.user.phone });
  return successResponse({ res, data: req.user });
});
```

</details>

</details>

---

<details>
<summary><code>PUT</code> &nbsp; <strong>/user</strong> — Update profile (username, bio, avatar) &nbsp; ⬜ <em>Not yet implemented</em></summary>

<br/>

> ⬜ *Add details when implemented*

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/user/:username</strong> — Get public profile by username &nbsp; ⬜ <em>Not yet implemented</em></summary>

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
