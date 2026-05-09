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
- [Database Structure](#-database-structure)
- [Project Structure](#%EF%B8%8F-project-structure)
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

- [x] JWT — Role-aware token system with Bearer/Admin signature levels, `decodeToken`, and `generateLoginCredentials` (`src/utils/security/token.security.js`)

<details>
<summary><strong>🪙 JWT Tokens</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";

export const signatureLevelEnum = { bearer: "Bearer", admin: "Admin" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const genAccessToken = async ({
  payload = {},
  signature = process.env.JWT_ACCESS_USER_KEY,
  options = { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const genRefreshToken = async ({
  payload = {},
  signature = process.env.JWT_REFRESH_USER_KEY,
  options = { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.JWT_REFRESH_USER_KEY,
} = {}) => {
  return jwt.verify(token, signature);
};

export const getSignatures = async ({
  signatureLevel = signatureLevelEnum.bearer,
} = {}) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };
  switch (signatureLevel) {
    case signatureLevelEnum.admin:
      signatures.accessSignature = process.env.JWT_ACCESS_ADMIN_KEY;
      signatures.refreshSignature = process.env.JWT_REFRESH_ADMIN_KEY;
      break;
    default:
      signatures.accessSignature = process.env.JWT_ACCESS_USER_KEY;
      signatures.refreshSignature = process.env.JWT_REFRESH_USER_KEY;
  }
  return signatures;
};

export const decodeToken = async ({
  next,
  authorization = "",
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token)
    return next(new Error("Missing-Token-Parts", { cause: 401 }));
  let signatures = await getSignatures({ signatureLevel: Bearer });
  const decoded = await verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? signatures.accessSignature
        : signatures.refreshSignature,
  });
  if (!decoded?._id) return next(new Error("Invalid-Token", { cause: 400 }));
  const user = await DBService.findById({ model: userModel, id: decoded._id });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));
  return user;
};

export const generateLoginCredentials = async ({ user } = {}) => {
  let signatures = await getSignatures({
    signatureLevel:
      user.role !== "user"
        ? signatureLevelEnum.admin
        : signatureLevelEnum.bearer,
  });
  const access_token = await genAccessToken({
    payload: { _id: user._id },
    signature: signatures.accessSignature,
  });
  const refresh_token = await genRefreshToken({
    payload: { _id: user._id },
    signature: signatures.refreshSignature,
  });
  return { access_token, refresh_token };
};
```

</details>

- [x] Authentication middleware — decodes Bearer/Admin token, attaches user to `req.user`, supports access & refresh token types (`src/middleware/authentication.middleware.js`)

<details>
<summary><strong>🛡️ Authentication Middleware</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
import { asyncHandler } from "../utils/response.js";
import {
  decodeToken,
  tokenTypeEnum,
} from "../utils/security/token.security.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    req.user = await decodeToken({
      next,
      authorization: req.headers?.authorization,
      tokenType,
    });
    return next();
  });
};
```

</details>

- [x] CORS — configured to allow specific origins (`cors`)
- [x] Google OAuth — unified `signupOrLoginWithGmail` method using `google-auth-library`

<details>
<summary><strong>🔗 Google OAuth — signupOrLoginWithGmail</strong> — <em>Click to see implementation</em></summary>

<br/>

```javascript
async function verifyGoogle({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_IDS.split(","),
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signupOrLoginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, picture, email_verified } = await verifyGoogle({ idToken });

  if (!email_verified) {
    return next(new Error("Email Not Verified", { cause: 401 }));
  }

  const user = await DBService.findOne({ model: userModel, filter: { email } });

  if (user) {
    if (user.provider === providerEnum[1]) {
      const credentials = await generateLoginCredentials({ user });
      return successResponse({ res, status: 200, data: credentials });
    }
    return next(new Error("Email Exist", { cause: 409 }));
  }

  const newUser = await DBService.create({
    model: userModel,
    data: [{ fullName: name, email, confirmEmail: Date.now(), picture, provider: providerEnum[1] }],
  });
  const credentials = await generateLoginCredentials({ user: newUser });
  return successResponse({
    res,
    message: "User created successfully",
    status: 201,
    data: credentials,
  });
});
```

</details>

- [x] OTP Email Verification — `nodemailer` transporter + `EventEmitter`-based email event system

<details>
<summary><strong>📧 Email Service + Event System</strong> — <em>Click to see implementation</em></summary>

<br/>

**`src/utils/email/send.email.js`**
```javascript
import nodemailer from "nodemailer";

export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  subject = "Sarahaa App",
  text = "",
  html = "",
  attachments = [],
} = {}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Sarahaa App" <${from}>`,
    to, cc, bcc, subject, text, html, attachments,
  });
}
```

**`src/utils/email/email.event.js`**
```javascript
import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { confirmEmailTemplate } from "../email/templates/ConfirmEmail.template.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data = {}) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm-Email",
    html: confirmEmailTemplate({ otp: data.otp }),
  }).catch((error) => {
    console.log("Fail to send the email", error);
  });
});
```

**Email Preview:**

![Confirm Email Template](https://drive.google.com/uc?export=view&id=1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f)

</details>

---

### 🔜 In Progress / Upcoming

- [ ] Rate limiting per IP (`express-rate-limit`)
- [ ] Helmet security headers
- [ ] Joi request validation on all routes
- [ ] Multer file upload handling
- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Public profile page per user
- [ ] Block/report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard (future)

---

## 🗃️ Database Structure

### MongoDB Connection

> Managed via `src/DB/connection.js` using Mongoose.

---

### 📄 User Model — `src/DB/models/user.model.js`

| Field | Type | Constraints |
|---|---|---|
| `firstName` | String | Required · min: 2 · max: 20 |
| `lastName` | String | Required · min: 2 · max: 20 |
| `fullName` | Virtual | `get` → `firstName lastName` · `set` → splits into first/last |
| `email` | String | Required · Unique |
| `password` | String | Required only if `provider === "system"` · Stored as bcrypt hash |
| `phone` | String | Required only if `provider === "system"` · Stored AES-encrypted |
| `gender` | String | Enum: `male` / `female` · Default: `male` |
| `role` | String | Enum: `user` / `admin` · Default: `user` |
| `provider` | String | Enum: `system` / `google` · Default: `system` |
| `picture` | String | Profile picture URL (set on Google OAuth) |
| `confirmEmail` | Date | Set when email is verified · absent = unverified |
| `confirmEmailOtp` | String | Hashed OTP · temporary · removed with `$unset` after verification |
| `otpDate` | Date | OTP generation timestamp · used for 2-min expiry check |
| `timestamps` | — | `createdAt` & `updatedAt` auto-managed |

<details>
<summary><strong>Click to see schema code</strong></summary>

<br/>

```javascript
import mongoose from "mongoose";

const genderEnum = ["male", "female"];
const roleEnum = ["user", "admin"];
export const providerEnum = ["system", "google"];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, "first name must be at least 2 characters"],
      maxLength: [20, "first name must be at most 20 characters"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, "last name must be at least 2 characters"],
      maxLength: [20, "last name must be at most 20 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum[0] ? true : false;
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum[0] ? true : false;
      },
    },
    gender: {
      type: String,
      enum: {
        values: genderEnum,
        message: `Gender allows only ${genderEnum[0]} or ${genderEnum[1]}`,
      },
      default: genderEnum[0],
    },
    role: {
      type: String,
      enum: {
        values: roleEnum,
        message: `Role allows only ${roleEnum[0]} or ${roleEnum[1]}`,
      },
      default: roleEnum[0],
    },
    provider: {
      type: String,
      enum: {
        values: providerEnum,
        message: `Provider allows only ${providerEnum[0]} or ${providerEnum[1]}`,
      },
      default: providerEnum[0],
    },
    picture: String,
    confirmEmail: Date,
    confirmEmailOtp: String,
    otpDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
userModel.syncIndexes();
```

</details>

---

### 🗄️ DB Service Layer — `src/DB/db.service.js`

Generalized ODM-agnostic methods so swapping Mongoose requires changes in one place only.

<details>
<summary><strong>Click to see all methods</strong></summary>

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

---

## 🗂️ Project Structure

```
SARAHAA-APP/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   └── user/
│   │       ├── user.controller.js
│   │       └── user.routes.js
│   ├── DB/
│   │   ├── models/
│   │   │   └── user.model.js          (fullName, email, password, gender, phone, role)
│   │   ├── db.service.js              (findOne, findById, create, findByIdAndUpdate)
│   │   └── connection.js
│   ├── middleware/
│   │   └── authentication.middleware.js
│   └── utils/
│       ├── response.js                (asyncHandler + success/error helpers + Global Error Handling)
│       ├── email/
│       │   ├── send.email.js          (nodemailer transporter)
│       │   └── templates/
│       │       └── ConfirmEmail.template.js
│       ├── events/
│       │   └── email.event.js         (EventEmitter — confirmEmail event)
│       └── security/
│           ├── hash.security.js       (bcrypt generateHash + compareHash)
│           ├── encrypt.security.js    (AES genEncrypt + genDecrypt)
│           ├── otp.security.js        (generateOtp + checkOtpAge)
│           └── token.security.js      (JWT gen/verify tokens + decodeToken + generateLoginCredentials + role-aware signatures)
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
<summary><strong>Routes</strong> — <em>auth.routes.js</em></summary>

<br/>

```javascript
import express from "express";
import * as authController from "./auth.controller.js";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/gmail", authController.signupOrLoginWithGmail);
router.patch("/confirm-email", authController.confirmEmail);
router.patch("/resend-otp", authController.resendOtp);

export default router;
```

</details>

---

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
  "phone": "01234567891",
  "role": "user"
}
```

**Response `201` — Success:**
```json
{
  "message": "User created successfully and Please check your email to verify"
}
```

> 📧 An OTP is generated, hashed, stored in the DB, and emitted via `emailEvent` — no tokens returned until email is confirmed.

**Response `409` — Email already exists:**
```json
{ "err_message": "Email already exists" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone, role } = req.body;
  if (await DBService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  const hashedPassword = await generateHash({ plainText: password });
  const encPhone = await genEncrypt({ plainText: phone });
  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();
  const user = await DBService.create({
    model: userModel,
    data: [{ fullName, email, password: hashedPassword, gender, phone: encPhone, role, confirmEmailOtp, otpDate: Date.now() }],
  });
  emailEvent.emit("confirmEmail", { to: email, otp });
  return successResponse({
    res,
    message: "User created successfully and Please check your email to verify",
    status: 201,
  });
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

**Response `200` — Success** *(message adapts based on role)*:
```json
{
  "message": "User Logged in successfully",
  "data": {
    "access_token": "<jwt_access_token>",
    "refresh_token": "<jwt_refresh_token>"
  }
}
```

> 🔑 Tokens are signed with **Bearer** keys for regular users and **Admin** keys for admins, via `generateLoginCredentials`.

**Response `401` — Email not verified:**
```json
{ "err_message": "Please verify your account" }
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
  const user = await DBService.findOne({ model: userModel, filter: { email, provider: providerEnum[0] } });
  if (!user) return next(new Error("Invalid email or password", { cause: 404 }));
  if (!user.confirmEmail) return next(new Error("Please verify your account", { cause: 401 }));
  const match = await compareHash({ plainText: password, hashed: user.password });
  if (!match) return next(new Error("Invalid email or password", { cause: 404 }));
  const credentials = await generateLoginCredentials({ user });
  return successResponse({
    res,
    status: 200,
    message: `${user.role === "user" ? "User" : "Admin"} Logged in successfully`,
    data: credentials,
  });
});
```

</details>

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/gmail</strong> — Signup or Login with Google</summary>

<br/>

**Request Body:**
```json
{ "idToken": "<google_id_token>" }
```

**Response `201` — New user created:**
```json
{
  "message": "User created successfully",
  "data": { "access_token": "...", "refresh_token": "..." }
}
```

**Response `200` — Existing Google user logged in:**
```json
{
  "message": "Done",
  "data": { "access_token": "...", "refresh_token": "..." }
}
```

**Response `401` — Google email not verified:**
```json
{ "err_message": "Email Not Verified" }
```

**Response `409` — Email exists with system provider:**
```json
{ "err_message": "Email Exist" }
```

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/confirm-email</strong> — Verify email with OTP</summary>

<br/>

**Request Body:**
```json
{ "email": "a1@example.com", "otp": "123456" }
```

**Response `200` — Success:**
```json
{
  "message": "Email Verified Successfully",
  "data": { "_id": "...", "email": "a1@example.com", "confirmEmail": "..." }
}
```

**Response `404` — Email invalid or already confirmed:**
```json
{ "err_message": "Invalid Email or Has Been Confirmed Before" }
```

**Response `400` — Wrong OTP:**
```json
{ "err_message": "Invalid OTP" }
```

**Response `400` — OTP expired:**
```json
{ "err_message": "OTP has expired, please request a new one" }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      otpDate: { $exists: true },
    },
  });
  if (!user) return next(new Error("Invalid Email or Has Been Confirmed Before", { cause: 404 }));
  const matchOtp = await compareHash({ plainText: otp, hashed: user.confirmEmailOtp });
  if (!matchOtp) return next(new Error("Invalid OTP"));
  if (await checkOtpAge({ caller: "confirmEmail", user })) {
    return next(new Error("OTP has expired, please request a new one"));
  }
  const newUser = await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: true, otpDate: true },
      $inc: { __v: 1 },
    },
  });
  return successResponse({ res, message: "Email Verified Successfully", data: newUser });
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/resend-otp</strong> — Resend OTP to email</summary>

<br/>

**Request Body:**
```json
{ "email": "a1@example.com" }
```

**Response `200` — Success:**
```json
{ "message": "OTP resent successfully check your email" }
```

**Response `404` — Email invalid or already confirmed:**
```json
{ "err_message": "Invalid Email or Already Confirmed" }
```

**Response `400` — Too soon to resend:**
```json
{ "err_message": "Please wait 2 mins before resending." }
```

<details>
<summary><em>Controller code</em></summary>

```javascript
export const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      otpDate: { $exists: true },
    },
  });
  if (!user) return next(new Error("Invalid Email or Already Confirmed", { cause: 404 }));
  const now = Date.now();
  const waitSecs = await checkOtpAge({ caller: "resend", user });
  if (waitSecs) return next(new Error(`Please wait ${Math.ceil(waitSecs / 60)} mins before resending.`));
  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();
  await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: { confirmEmailOtp, otpDate: now },
  });
  emailEvent.emit("confirmEmail", { to: email, otp });
  return successResponse({ res, message: "OTP resent successfully check your email" });
});
```

</details>

</details>

---

## 👤 User — `/user` &nbsp; 🔒 *Protected*

<details>
<summary><strong>Routes</strong> — <em>user.routes.js</em></summary>

<br/>

```javascript
import express from "express";
import * as userController from "./user.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../utils/security/token.security.js";
const router = express.Router();

router.get("/", authentication(), userController.getProfile);
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userController.getNewLoginCredentials
);

export default router;
```

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/user</strong> — Get current user profile</summary>

<br/>

> 🔒 Protected — pass access token in `Authorization` header using `Bearer` (user) or `Admin` prefix.

**Headers:**
```
Authorization: Bearer <access_token>
Authorization: Admin <access_token>
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

**Response `401` — Missing token parts:**
```json
{ "err_message": "Missing-Token-Parts" }
```

**Response `400` — Invalid token:**
```json
{ "err_message": "Invalid-Token" }
```

**Response `404` — User not found:**
```json
{ "err_message": "User Not Found" }
```

> 📝 *Phone is stored encrypted in DB and decrypted before being returned.*

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
<summary><code>GET</code> &nbsp; <strong>/user/refresh-token</strong> — Get new access & refresh tokens</summary>

<br/>

> 🔒 Protected — pass **refresh token** in `Authorization` header using `Bearer` (user) or `Admin` prefix.

**Headers:**
```
Authorization: Bearer <refresh_token>
Authorization: Admin <refresh_token>
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

**Response `401` — Missing token parts:**
```json
{ "err_message": "Missing-Token-Parts" }
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
export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const newCredentials = await generateLoginCredentials({ user: req.user });
  return successResponse({ res, status: 200, data: newCredentials });
});
```

</details>

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
