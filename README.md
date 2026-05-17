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
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Implementation Details](#-implementation-details)
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
- Full auth system with email OTP verification, Google OAuth, and password reset flow

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (access & refresh), Google OAuth (`google-auth-library`) |
| Security | bcryptjs, CryptoJS (AES), CORS |
| Validation | Joi |
| Email | Nodemailer + Node EventEmitter |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |

---

## ✅ Features

### ✔️ Completed

| # | Feature | File |
|---|---|---|
| 1 | Modular project structure & setup | `src/` |
| 2 | MongoDB connection | `DB/connection.js` |
| 3 | Global async error handler | `utils/response.js` |
| 4 | Uniform JSON success/error response | `utils/response.js` |
| 5 | bcrypt password hashing & comparison | `utils/security/hash.security.js` |
| 6 | AES symmetric encryption on sensitive fields | `utils/security/encrypt.security.js` |
| 7 | nanoid OTP generation + 2-min expiry logic | `utils/security/otp.security.js` |
| 8 | JWT role-aware token system (Bearer/Admin) | `utils/security/token.security.js` |
| 9 | Auth middleware — authentication, authorization, combined `auth` | `middleware/auth.middleware.js` |
| 10 | Centralized Joi validation middleware | `middleware/validation.middleware.js` |
| 11 | CORS configured for specific origins | `app.controller.js` |
| 12 | Google OAuth — unified signup/login via `google-auth-library` | `modules/auth/auth.controller.js` |
| 13 | OTP email verification with EventEmitter | `utils/events/email.event.js` |
| 14 | Forget password — OTP-based reset flow (3 steps) | `modules/auth/auth.controller.js` |
| 15 | User profile — get, update basic info, update password | `modules/user/user.controller.js` |
| 16 | Account soft-delete (freeze) & restore | `modules/user/user.controller.js` |
| 17 | Hard delete account (admin only) | `modules/user/user.controller.js` |
| 18 | Public share profile by userId | `modules/user/user.controller.js` |
| 19 | Refresh token endpoint | `modules/user/user.controller.js` |

---

### 🔜 In Progress / Upcoming

- [ ] Rate limiting per IP (`express-rate-limit`)
- [ ] Helmet security headers
- [ ] Multer file upload handling
- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Block/report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard

---

## 🔧 Implementation Details

<details>
<summary><strong>🛠️ asyncHandler + successResponse + globalErrorHandling</strong></summary>

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

export const successResponse = ({ res, message = "Done", status = 200, data }) => {
  return res.status(status).json({ message, data });
};

export const globalErrorHandling = (error, req, res, next) => {
  return res
    .status(error.cause || 400)
    .json({ err_message: error.message, stack: error.stack });
};
```

</details>

<details>
<summary><strong>🔒 Hashing — bcrypt</strong></summary>

<br/>

```javascript
import bcrypt from "bcryptjs";

export const generateHash = async ({ plainText = "", salt = 12 }) => {
  return bcrypt.hashSync(plainText, parseInt(salt));
};

export const compareHash = async ({ plainText = "", hashed = "" }) => {
  return bcrypt.compareSync(plainText, hashed);
};
```

</details>

<details>
<summary><strong>🔐 Encryption — AES (crypto-js)</strong></summary>

<br/>

```javascript
import CryptoJS from "crypto-js";

export const genEncrypt = async ({ plainText = "", secretKey = process.env.AES_SECRET_KEY }) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

export const genDecrypt = async ({ cipherText = "", secretKey = process.env.AES_SECRET_KEY }) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8);
};
```

</details>

<details>
<summary><strong>🔢 OTP — nanoid + expiry logic</strong></summary>

<br/>

```javascript
import { customAlphabet } from "nanoid";
import { generateHash } from "../../utils/security/hash.security.js";

export const generateOtp = async () => {
  const otp = customAlphabet("0123456789", 6)();
  const hashedOtp = await generateHash({ plainText: otp });
  return { otp, hashedOtp };
};

export const checkOtpAge = async ({ caller = "", user } = {}) => {
  const otpAge = Date.now() - new Date(user.otpDate).getTime();
  switch (caller) {
    case "confirmEmail":
      if (otpAge > 60000 * 2) return true;
      break;
    default:
      if (otpAge < 60000 * 2) {
        return Math.ceil((60000 * 2 - otpAge) / 1000);
      }
      break;
  }
};
```

</details>

<details>
<summary><strong>🪙 JWT — Role-aware Token System</strong></summary>

<br/>

```javascript
import jwt from "jsonwebtoken";

export const signatureLevelEnum = { bearer: "Bearer", admin: "Admin" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const getSignatures = async ({ signatureLevel = signatureLevelEnum.bearer } = {}) => {
  if (signatureLevel === signatureLevelEnum.admin) {
    return { accessSignature: process.env.JWT_ACCESS_ADMIN_KEY, refreshSignature: process.env.JWT_REFRESH_ADMIN_KEY };
  }
  return { accessSignature: process.env.JWT_ACCESS_USER_KEY, refreshSignature: process.env.JWT_REFRESH_USER_KEY };
};

export const decodeToken = async ({ next, authorization = "", tokenType = tokenTypeEnum.access } = {}) => {
  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token) return next(new Error("Missing-Token-Parts", { cause: 401 }));
  const signatures = await getSignatures({ signatureLevel: Bearer });
  const decoded = jwt.verify(token, tokenType === tokenTypeEnum.access ? signatures.accessSignature : signatures.refreshSignature);
  if (!decoded?._id) return next(new Error("Invalid-Token", { cause: 400 }));
  const user = await DBService.findById({ model: userModel, id: decoded._id });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));
  return user;
};

export const generateLoginCredentials = async ({ user } = {}) => {
  const signatures = await getSignatures({
    signatureLevel: user.role !== "user" ? signatureLevelEnum.admin : signatureLevelEnum.bearer,
  });
  return {
    access_token: jwt.sign({ _id: user._id }, signatures.accessSignature, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }),
    refresh_token: jwt.sign({ _id: user._id }, signatures.refreshSignature, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }),
  };
};
```

</details>

<details>
<summary><strong>🛡️ Auth Middleware — authentication + authorization + auth</strong></summary>

<br/>

```javascript
import { asyncHandler } from "../utils/response.js";
import { decodeToken, tokenTypeEnum } from "../utils/security/token.security.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    req.user = await decodeToken({ next, authorization: req.headers?.authorization, tokenType });
    return next();
  });
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user?.role))
      return next(new Error("Unauthorized Account", { cause: 403 }));
    return next();
  });
};

export const auth = ({ tokenType = tokenTypeEnum.access, accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    req.user = await decodeToken({ next, authorization: req.headers?.authorization, tokenType });
    if (!accessRoles.includes(req.user?.role))
      return next(new Error("Unauthorized Account", { cause: 403 }));
    return next();
  });
};
```

</details>

<details>
<summary><strong>✅ Validation Middleware + generalFields</strong></summary>

<br/>

`generalFields` is defined in `validation.middleware.js` and shared across all module validation files.

```javascript
import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) =>
  Types.ObjectId.isValid(value) ? true : helper.message("Invalid ObjectId");

export const generalFields = {
  fullName: joi.string().trim().min(5).max(41).custom((value, helpers) => {
    const parts = value.split(/\s+/);
    if (parts.length < 2) return helpers.message("fullName must contain at least first and last name");
    if (parts[0].length < 2 || parts[0].length > 20) return helpers.message("first name must be 2–20 chars");
    if (parts[1].length < 2 || parts[1].length > 20) return helpers.message("last name must be 2–20 chars");
    return value;
  }),
  email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ["com","net","gov","edu","org","io"] } })
    .messages({ "string.email": "Please provide a valid email address" }),
  password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({ "string.pattern.base": "Password: min 8 chars, uppercase, lowercase, number & special char (@$!%*?&)" }),
  phone: joi.string().pattern(/^01[0125][0-9]{8}$/)
    .messages({ "string.pattern.base": "Valid Egyptian numbers only: 010, 011, 012, 015" }),
  gender: joi.string().valid("male", "female"),
  role: joi.string().valid("user", "admin"),
  otp: joi.string().length(6).pattern(/^[0-9]+$/),
  idToken: joi.string(),
  id: joi.string().custom(validateObjectId),
};

export const validation = ({ schema } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const validationError = [];
    for (let key of Object.keys(schema)) {
      const result = schema[key].validate(req[key], { abortEarly: false });
      if (result.error) validationError.push({ key, details: result.error.details });
    }
    if (validationError.length) return res.status(400).json({ err_message: "Validation Error", validationError });
    return next();
  });
};
```

</details>

<details>
<summary><strong>🔗 Google OAuth — signupOrLoginWithGmail</strong></summary>

<br/>

```javascript
async function verifyGoogle({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.WEB_CLIENT_IDS.split(",") });
  return ticket.getPayload();
}

export const signupOrLoginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, picture, email_verified } = await verifyGoogle({ idToken });
  if (!email_verified) return next(new Error("Email Not Verified", { cause: 401 }));
  const user = await DBService.findOne({ model: userModel, filter: { email } });
  if (user) {
    if (user.provider === providerEnum[1]) {
      return successResponse({ res, status: 200, data: await generateLoginCredentials({ user }) });
    }
    return next(new Error("Email Exist", { cause: 409 }));
  }
  const newUser = await DBService.create({
    model: userModel,
    data: [{ fullName: name, email, confirmEmail: Date.now(), picture, provider: providerEnum[1] }],
  });
  return successResponse({ res, message: "User created successfully", status: 201, data: await generateLoginCredentials({ user: newUser }) });
});
```

</details>

<details>
<summary><strong>📧 Email Service + Event System</strong></summary>

<br/>

**`src/utils/email/send.email.js`** — Nodemailer transporter via Gmail service.

**`src/utils/events/email.event.js`**
```javascript
import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { emailTemplate } from "../email/templates/Email.template.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data = {}) => {
  await sendEmail({ to: data.to, subject: data.subject || "Confirm-Email", html: emailTemplate({ otp: data.otp }) })
    .catch((error) => console.log("Fail to send the email", error));
});

emailEvent.on("forgetPassword", async (data = {}) => {
  await sendEmail({ to: data.to, subject: data.subject || "Reset Password", html: emailTemplate({ otp: data.otp, title: data.title }) })
    .catch((error) => console.log("Fail to send the email", error));
});
```

**Confirm Email Preview:**

![Confirm Email Template](https://drive.google.com/uc?export=view&id=1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f)

**Forget Password Email Preview:**

![Forget Password Email Template](https://drive.google.com/uc?export=view&id=1CJAQzEyuI33c8Kftqd4VgE84uZ6nuB-Y)

</details>

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
| `password` | String | Required if `provider === "system"` · bcrypt hashed |
| `oldPasswords` | [String] | Array of previous hashed passwords — prevents reuse |
| `phone` | String | Required if `provider === "system"` · AES-encrypted |
| `gender` | String | Enum: `male` / `female` · Default: `male` |
| `role` | String | Enum: `user` / `admin` · Default: `user` |
| `provider` | String | Enum: `system` / `google` · Default: `system` |
| `picture` | String | Profile picture URL (Google OAuth) |
| `confirmEmail` | Date | Set on email verification · absent = unverified |
| `confirmEmailOtp` | String | Hashed OTP · removed with `$unset` after verification |
| `forgetPasswordOtp` | String | Hashed OTP for password reset · removed after use |
| `otpDate` | Date | OTP generation timestamp · used for 2-min expiry |
| `deletedAt` | Date | Soft-delete timestamp · absent = active account |
| `deletedBy` | ObjectId | Reference to user who deleted the account |
| `restoredAt` | Date | Restore timestamp |
| `restoredBy` | ObjectId | Reference to admin who restored the account |
| `timestamps` | — | `createdAt` & `updatedAt` auto-managed |

<details>
<summary><strong>Click to see schema code</strong></summary>

<br/>

```javascript
import mongoose from "mongoose";

const genderEnum = ["male", "female"];
export const roleEnum = ["user", "admin"];
export const providerEnum = ["system", "google"];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: [2, "min 2"], maxLength: [20, "max 20"] },
    lastName: { type: String, required: true, minLength: [2, "min 2"], maxLength: [20, "max 20"] },
    email: { type: String, required: true, unique: [true, "email must be unique"] },
    password: { type: String, required: function () { return this.provider === providerEnum[0]; } },
    oldPasswords: [String],
    phone: { type: String, required: function () { return this.provider === providerEnum[0]; } },
    gender: { type: String, enum: { values: genderEnum, message: `Gender allows only male or female` }, default: genderEnum[0] },
    role: { type: String, enum: { values: roleEnum, message: `Role allows only user or admin` }, default: roleEnum[0] },
    provider: { type: String, enum: { values: providerEnum, message: `Provider allows only system or google` }, default: providerEnum[0] },
    picture: String,
    confirmEmail: Date,
    confirmEmailOtp: String,
    forgetPasswordOtp: String,
    otpDate: Date,
    deletedAt: Date,
    deletedBy: mongoose.Schema.Types.ObjectId,
    restoredAt: Date,
    restoredBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () { return `${this.firstName} ${this.lastName}`; });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
userModel.syncIndexes();
```

</details>

---

### 🗄️ DB Service Layer — `src/DB/db.service.js`

Generalized ODM-agnostic data access layer. Swapping Mongoose only requires changes here.

<details>
<summary><strong>Click to see all methods</strong></summary>

<br/>

```javascript
export const findOne = async ({ model, filter = {}, projection = {}, populate = [] } = {}) =>
  await model.findOne(filter, projection).populate(populate);

export const findById = async ({ model, id, projection = {}, populate = [] } = {}) =>
  await model.findById(id, projection).populate(populate);

export const create = async ({ model, data = [{}], options = { validateBeforeSave: true } } = {}) =>
  await model.create(data, options);

export const findByIdAndUpdate = async ({ model, id, updatedData = {}, options = { returnDocument: "after" } } = {}) =>
  await model.findByIdAndUpdate(id, { ...updatedData, $inc: { __v: 1 } }, options);

export const findOneAndUpdate = async ({ model, filter = {}, updatedData = {}, options } = {}) =>
  await model.findOneAndUpdate(filter, { ...updatedData, $inc: { __v: 1 } }, options);

export const deleteOne = async ({ model, filter = {} } = {}) =>
  await model.deleteOne(filter);
```

</details>

---

## 🗂️ Project Structure

```
SARAHAA-APP/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js     (signup, login, gmail, confirmEmail, resendOtp, forgetPassword, verifyForgetPassword, resetPassword)
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js     (Joi schemas for all auth routes)
│   │   └── user/
│   │       ├── user.controller.js     (getProfile, updateBasicProfile, updatePassword, shareProfile, freezeAccount, restoreAccount, deleteAccount, getNewLoginCredentials)
│   │       ├── user.routes.js
│   │       ├── user.validation.js     (Joi schemas for all user routes)
│   │       └── user.authorization.js  (role access lists per endpoint)
│   ├── DB/
│   │   ├── models/
│   │   │   └── user.model.js          (full schema: auth fields, OTP fields, soft-delete fields, oldPasswords)
│   │   ├── db.service.js              (findOne, findById, create, findByIdAndUpdate, findOneAndUpdate, deleteOne)
│   │   └── connection.js
│   ├── middleware/
│   │   ├── auth.middleware.js         (authentication, authorization, auth)
│   │   └── validation.middleware.js   (generalFields + centralized Joi validation)
│   └── utils/
│       ├── response.js                (asyncHandler, successResponse, globalErrorHandling)
│       ├── email/
│       │   ├── send.email.js          (nodemailer transporter)
│       │   └── templates/
│       │       └── Email.template.js  (shared template for confirmEmail + forgetPassword)
│       ├── events/
│       │   └── email.event.js         (EventEmitter: confirmEmail + forgetPassword events)
│       └── security/
│           ├── hash.security.js       (bcrypt generateHash + compareHash)
│           ├── encrypt.security.js    (AES genEncrypt + genDecrypt)
│           ├── otp.security.js        (nanoid generateOtp + checkOtpAge)
│           └── token.security.js      (JWT gen/verify + decodeToken + generateLoginCredentials + role-aware signatures)
│   ├── app.controller.js              (Express app setup, CORS, route mounting, global error handler)
│   └── index.js                       (server entry point)
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 📖 API Documentation

> **Base URL:** `http://localhost:5000`  
> 🔒 Protected routes require `Authorization: Bearer <token>` or `Authorization: Admin <token>` header.  
> ❌ All routes return `400 Validation Error` on invalid input — omitted per endpoint for brevity.

---

## 🔑 Auth — `/auth`

<details>
<summary><strong>Routes — auth.routes.js</strong></summary>

<br/>

```javascript
router.post("/signup",           validation({ schema: validators.signup }),                  authController.signup);
router.post("/login",            validation({ schema: validators.login }),                   authController.login);
router.post("/gmail",            validation({ schema: validators.signupOrLoginWithGmail }), authController.signupOrLoginWithGmail);
router.patch("/confirm-email",   validation({ schema: validators.confirmEmail }),            authController.confirmEmail);
router.patch("/resend-otp",      validation({ schema: validators.resendOtp }),               authController.resendOtp);
router.patch("/forget-password", validation({ schema: validators.forgetPassword }),          authController.forgetPassword);
router.patch("/verify-forget-password", validation({ schema: validators.verifyForgetPassword }), authController.verifyForgetPassword);
router.patch("/reset-password",  validation({ schema: validators.resetPassword }),           authController.resetPassword);
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
  "email": "ahmed@example.com",
  "password": "Ahmed@1234",
  "phone": "01012345678",
  "gender": "male",
  "role": "user"
}
```

> 📋 `fullName` first + last (2–20 chars each) · `email` valid TLD (com/net/org/io/gov/edu) · `password` min 8 chars + uppercase + lowercase + number + `@$!%*?&` · `phone` Egyptian (010/011/012/015) · `gender` & `role` optional enums

**Response `201`:**
```json
{ "message": "User created successfully and Please check your email to verify" }
```

**Response `409`:** `{ "err_message": "Email already exists" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone, role } = req.body;
  if (await DBService.findOne({ model: userModel, filter: { email } }))
    return next(new Error("Email already exists", { cause: 409 }));
  const hashedPassword = await generateHash({ plainText: password });
  const encPhone = await genEncrypt({ plainText: phone });
  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();
  await DBService.create({
    model: userModel,
    data: [{ fullName, email, password: hashedPassword, gender, phone: encPhone, role, confirmEmailOtp, otpDate: Date.now() }],
  });
  emailEvent.emit("confirmEmail", { to: email, otp });
  return successResponse({ res, message: "User created successfully and Please check your email to verify", status: 201 });
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
  "email": "ahmed@example.com",
  "password": "Ahmed@1234"
}
```

> 📋 Same `email` and `password` rules as signup

**Response `200`:**
```json
{
  "message": "User Logged in successfully",
  "data": { "access_token": "...", "refresh_token": "..." }
}
```

> 🔑 `Bearer` keys for users · `Admin` keys for admins — resolved via `generateLoginCredentials`

**Response `401`:** `{ "err_message": "Please verify your account" }`  
**Response `404`:** `{ "err_message": "Invalid email or password" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email, provider: providerEnum[0] } });
  if (!user) return next(new Error("Invalid email or password", { cause: 404 }));
  if (!user.confirmEmail) return next(new Error("Please verify your account", { cause: 401 }));
  const match = await compareHash({ plainText: password, hashed: user.password });
  if (!match) return next(new Error("Invalid email or password", { cause: 404 }));
  const credentials = await generateLoginCredentials({ user });
  return successResponse({ res, status: 200, message: `${user.role === "user" ? "User" : "Admin"} Logged in successfully`, data: credentials });
});
```

</details>

</details>

---

<details>
<summary><code>POST</code> &nbsp; <strong>/auth/gmail</strong> — Signup or Login with Google</summary>

<br/>

**Request Body:** `{ "idToken": "<google_id_token>" }`

**Response `201`** (new user): `{ "message": "User created successfully", "data": { "access_token": "...", "refresh_token": "..." } }`  
**Response `200`** (existing): `{ "message": "Done", "data": { "access_token": "...", "refresh_token": "..." } }`  
**Response `401`:** `{ "err_message": "Email Not Verified" }`  
**Response `409`:** `{ "err_message": "Email Exist" }`

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/confirm-email</strong> — Verify email with OTP</summary>

<br/>

**Request Body:** `{ "email": "ahmed@example.com", "otp": "123456" }`

**Response `200`:** `{ "message": "Email Verified Successfully", "data": { ... } }`  
**Response `404`:** `{ "err_message": "Invalid Email or Has Been Confirmed Before" }`  
**Response `400`:** `{ "err_message": "Invalid OTP" }` or `{ "err_message": "OTP has expired, please request a new one" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email, confirmEmail: { $exists: false }, confirmEmailOtp: { $exists: true }, otpDate: { $exists: true } } });
  if (!user) return next(new Error("Invalid Email or Has Been Confirmed Before", { cause: 404 }));
  if (!(await compareHash({ plainText: otp, hashed: user.confirmEmailOtp }))) return next(new Error("Invalid OTP"));
  if (await checkOtpAge({ caller: "confirmEmail", user })) return next(new Error("OTP has expired, please request a new one"));
  const newUser = await DBService.findByIdAndUpdate({ model: userModel, id: user._id, updatedData: { confirmEmail: Date.now(), $unset: { confirmEmailOtp: true, otpDate: true } } });
  return successResponse({ res, message: "Email Verified Successfully", data: newUser });
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/resend-otp</strong> — Resend verification OTP</summary>

<br/>

**Request Body:** `{ "email": "ahmed@example.com" }`

**Response `200`:** `{ "message": "OTP resent successfully check your email" }`  
**Response `404`:** `{ "err_message": "Invalid Email or Already Confirmed" }`  
**Response `400`:** `{ "err_message": "Please wait 2 mins before resending." }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email, confirmEmail: { $exists: false }, confirmEmailOtp: { $exists: true }, otpDate: { $exists: true } } });
  if (!user) return next(new Error("Invalid Email or Already Confirmed", { cause: 404 }));
  const now = Date.now();
  const waitSecs = await checkOtpAge({ caller: "resend", user });
  if (waitSecs) return next(new Error(`Please wait ${Math.ceil(waitSecs / 60)} mins before resending.`));
  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();
  await DBService.findByIdAndUpdate({ model: userModel, id: user._id, updatedData: { confirmEmailOtp, otpDate: now } });
  emailEvent.emit("confirmEmail", { to: email, otp });
  return successResponse({ res, message: "OTP resent successfully check your email" });
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/forget-password</strong> — Request password reset OTP</summary>

<br/>

**Request Body:** `{ "email": "ahmed@example.com" }`

**Response `200`:** `{ "message": "Please check your email for the OTP to reset your password" }`  
**Response `404`:** `{ "err_message": "Email Not Found OR Not Verified" }`

> 📧 Sends a `forgetPassword` email event with a hashed OTP stored in `forgetPasswordOtp`.

<details>
<summary><em>Controller</em></summary>

```javascript
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const { hashedOtp, otp } = await generateOtp();
  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { email, provider: providerEnum[0], deletedAt: { $exists: false }, confirmEmail: { $exists: true } },
    updatedData: { forgetPasswordOtp: hashedOtp },
  });
  if (!user) return next(new Error("Email Not Found OR Not Verified", { cause: 404 }));
  emailEvent.emit("forgetPassword", { to: email, otp, subject: "Forget Password OTP", title: "Reset Password" });
  return successResponse({ res, message: "Please check your email for the OTP to reset your password" });
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/verify-forget-password</strong> — Verify reset OTP</summary>

<br/>

**Request Body:** `{ "email": "ahmed@example.com", "otp": "123456" }`

**Response `200`:** `{ "message": "OTP Verified Successfully, You Can Now Reset Your Password" }`  
**Response `404`:** `{ "err_message": "Email Not Found" }`  
**Response `400`:** `{ "err_message": "Invalid OTP" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const verifyForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email, provider: providerEnum[0], deletedAt: { $exists: false }, forgetPasswordOtp: { $exists: true }, confirmEmail: { $exists: true } } });
  if (!user) return next(new Error("Email Not Found", { cause: 404 }));
  if (!(await compareHash({ plainText: otp, hashed: user.forgetPasswordOtp }))) return next(new Error("Invalid OTP", { cause: 400 }));
  return successResponse({ res, message: "OTP Verified Successfully, You Can Now Reset Your Password" });
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/auth/reset-password</strong> — Set new password</summary>

<br/>

**Request Body:** `{ "email": "ahmed@example.com", "otp": "123456", "password": "NewPass@5678" }`

> 📋 `password` must satisfy the same strong-password rules as signup.

**Response `200`:** `{ "message": "Password Reset Successfully, You Can Now Login With Your New Password" }`  
**Response `404`:** `{ "err_message": "Email Not Found" }`  
**Response `400`:** `{ "err_message": "Invalid OTP" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;
  const user = await DBService.findOne({ model: userModel, filter: { email, provider: providerEnum[0], deletedAt: { $exists: false }, forgetPasswordOtp: { $exists: true }, confirmEmail: { $exists: true } } });
  if (!user) return next(new Error("Email Not Found", { cause: 404 }));
  if (!(await compareHash({ plainText: otp, hashed: user.forgetPasswordOtp }))) return next(new Error("Invalid OTP", { cause: 400 }));
  await DBService.findByIdAndUpdate({
    model: userModel, id: user._id,
    updatedData: { password: await generateHash({ plainText: password }), $unset: { forgetPasswordOtp: true } },
  });
  return successResponse({ res, message: "Password Reset Successfully, You Can Now Login With Your New Password" });
});
```

</details>

</details>

---

## 👤 User — `/user`

<details>
<summary><strong>Routes — user.routes.js</strong></summary>

<br/>

```javascript
router.get("/",                   auth({ accessRoles: endpoint.profile }),                                              userController.getProfile);
router.patch("/",                 authentication(), validation({ schema: validators.updateBasicProfile }),              userController.updateBasicProfile);
router.patch("/password",         authentication(), validation({ schema: validators.updatePassword }),                  userController.updatePassword);
router.get("/refresh-token",      authentication({ tokenType: tokenTypeEnum.refresh }),                                 userController.getNewLoginCredentials);
router.get("/:userId",            validation({ schema: validators.shareProfile }),                                      userController.shareProfile);
router.patch("/:userId/restore-account", auth({ accessRoles: endpoint.restoreAccount }), validation({ schema: validators.restoreAccount }), userController.restoreAccount);
router.delete("/:userId",         auth({ accessRoles: endpoint.deleteAccount }), validation({ schema: validators.deleteAccount }), userController.deleteAccount);
router.delete("{/:userId}/freeze-account", authentication(), validation({ schema: validators.freezeAccount }),         userController.freezeAccount);
```

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/user</strong> — Get current user profile 🔒</summary>

<br/>

**Headers:** `Authorization: Bearer <access_token>` or `Authorization: Admin <access_token>`

**Response `200`:**
```json
{
  "message": "Done",
  "data": { "_id": "...", "fullName": "Ahmed Essam", "email": "ahmed@example.com", "gender": "male", "phone": "01012345678" }
}
```

> 📝 Phone is stored encrypted and decrypted before returning.

**Response `401`:** `{ "err_message": "Missing-Token-Parts" }`  
**Response `403`:** `{ "err_message": "Unauthorized Account" }`  
**Response `404`:** `{ "err_message": "User Not Found" }`

<details>
<summary><em>Controller</em></summary>

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
<summary><code>PATCH</code> &nbsp; <strong>/user</strong> — Update basic profile 🔒</summary>

<br/>

**Headers:** `Authorization: Bearer <access_token>`

**Request Body** *(all optional)*:
```json
{
  "fullName": "Ahmed Updated",
  "phone": "01112345678",
  "gender": "male"
}
```

> 📋 `fullName`, `phone`, `gender` — same validation rules as signup. All fields optional.

**Response `200`:** `{ "message": "Done", "data": { ... } }`  
**Response `404`:** `{ "err_message": "User Not Found" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const updateBasicProfile = asyncHandler(async (req, res, next) => {
  if (req.body.phone) req.body.phone = await genEncrypt({ plainText: req.body.phone });
  const user = await DBService.findByIdAndUpdate({ model: userModel, id: req.user._id, updatedData: { ...req.body } });
  return user ? successResponse({ res, data: user }) : next(new Error("User Not Found", { cause: 404 }));
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/user/password</strong> — Update password 🔒</summary>

<br/>

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "oldPassword": "Ahmed@1234",
  "newPassword": "NewPass@5678"
}
```

> 📋 Both fields must satisfy strong-password rules. `newPassword` must not match `oldPassword` or any previously used password.

**Response `200`:** `{ "message": "Password Updated Successfully", "data": { ... } }`  
**Response `400`:** `{ "err_message": "Invalid Old Password" }`  
**Response `409`:** `{ "err_message": "New Password Should Not Be Same As Old Passwords" }`  
**Response `404`:** `{ "err_message": "User Not Found" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const updatePassword = asyncHandler(async (req, res, next) => {
  const match = await compareHash({ plainText: req.body.oldPassword, hashed: req.user.password });
  if (!match) return next(new Error("Invalid Old Password", { cause: 400 }));
  if (req.user.oldPasswords?.length) {
    for (let hash of req.user.oldPasswords) {
      if (await compareHash({ plainText: req.body.newPassword, hashed: hash }))
        return next(new Error("New Password Should Not Be Same As Old Passwords", { cause: 409 }));
    }
  }
  const hashedPassword = await generateHash({ plainText: req.body.newPassword });
  const user = await DBService.findByIdAndUpdate({ model: userModel, id: req.user._id, updatedData: { password: hashedPassword, $push: { oldPasswords: req.user.password } } });
  return user ? successResponse({ res, message: "Password Updated Successfully", data: user }) : next(new Error("User Not Found", { cause: 404 }));
});
```

</details>

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/user/refresh-token</strong> — Rotate tokens 🔒</summary>

<br/>

**Headers:** `Authorization: Bearer <refresh_token>` or `Authorization: Admin <refresh_token>`

**Response `200`:** `{ "message": "Done", "data": { "access_token": "...", "refresh_token": "..." } }`  
**Response `401`:** `{ "err_message": "Missing-Token-Parts" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const newCredentials = await generateLoginCredentials({ user: req.user });
  return successResponse({ res, status: 200, data: newCredentials });
});
```

</details>

</details>

---

<details>
<summary><code>GET</code> &nbsp; <strong>/user/:userId</strong> — Share / view public profile</summary>

<br/>

**Response `200`:**
```json
{
  "message": "Done",
  "data": { "_id": "...", "firstName": "Ahmed", "lastName": "Essam", "fullName": "Ahmed Essam", "email": "ahmed@example.com" }
}
```

**Response `404`:** `{ "err_message": "Invalid Account" }`  
**Response `400`:** `{ "err_message": "Validation Error" }` — invalid `userId` ObjectId

<details>
<summary><em>Controller</em></summary>

```javascript
export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOne({ model: userModel, filter: { _id: userId, confirmEmail: { $exists: true } }, projection: { firstName: 1, lastName: 1, fullName: 1, email: 1 } });
  return user ? successResponse({ res, data: user }) : next(new Error("Invalid Account", { cause: 404 }));
});
```

</details>

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <strong>/user/:userId/freeze-account</strong> — Soft-delete (freeze) account 🔒</summary>

<br/>

> Users can freeze their own account (no `userId` required). Admins can freeze any account by passing `userId`.

**Headers:** `Authorization: Bearer <access_token>`

**Response `204`:** *(no body)*  
**Response `403`:** `{ "err_message": "Unauthorized Access" }` — non-admin passing another userId  
**Response `404`:** `{ "err_message": "User Not Found or Already Freezed Account" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum[1]) return next(new Error("Unauthorized Access", { cause: 403 }));
  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    updatedData: { deletedAt: Date.now(), deletedBy: req.user._id, $unset: { restoredAt: 1, restoredBy: 1 } },
  });
  return user ? successResponse({ res, status: 204 }) : next(new Error("User Not Found or Already Freezed Account", { cause: 404 }));
});
```

</details>

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <strong>/user/:userId/restore-account</strong> — Restore frozen account 🔒 Admin only</summary>

<br/>

**Headers:** `Authorization: Admin <access_token>`

**Response `200`:** `{ "message": "Done" }`  
**Response `404`:** `{ "err_message": "User Not Found or Already Restored Account" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId, deletedAt: { $exists: true }, deletedBy: { $ne: userId } },
    updatedData: { restoredAt: Date.now(), restoredBy: req.user._id, $unset: { deletedAt: 1, deletedBy: 1 } },
  });
  return user ? successResponse({ res }) : next(new Error("User Not Found or Already Restored Account", { cause: 404 }));
});
```

</details>

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <strong>/user/:userId</strong> — Hard delete account 🔒 Admin only</summary>

<br/>

> Permanently deletes a previously frozen account. Account must have `deletedAt` set.

**Headers:** `Authorization: Admin <access_token>`

**Response `204`:** *(no body)*  
**Response `404`:** `{ "err_message": "User Not Found or Already Deleted" }`

<details>
<summary><em>Controller</em></summary>

```javascript
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.deleteOne({ model: userModel, filter: { _id: userId, deletedAt: { $exists: true } } });
  return user.deletedCount ? successResponse({ res, status: 204 }) : next(new Error("User Not Found or Already Deleted", { cause: 404 }));
});
```

</details>

</details>

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer  
📩 ahmedezsam@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with focus, coffee, and clean architecture principles ☕</sub>
</div>
