<div align="center">

<h1>🕵️ Sarahaa App</h1>
<p><strong>Anonymous Messaging Platform — REST API Backend</strong></p>

![Status](https://img.shields.io/badge/Status-In_Progress-f59e0b?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

<br/>

> A secure, scalable backend system for an anonymous social messaging platform.
> Users can send and receive anonymous messages with full auth, privacy controls, and hardened API security.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Security Design](#security-design)
- [API Reference](#api-reference)
  - [Auth — `/auth`](#auth----auth)
  - [User — `/user`](#user----user)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

Sarahaa is an anonymous messaging platform where users share a public link and receive messages from anyone — without the sender revealing their identity.

**Core flow:**
- Users register and receive a personal public link
- Anyone (authenticated or not) can send an anonymous message via that link
- Users view, manage, and reply to messages — replies are public, senders stay anonymous
- Full auth system: email OTP verification, Google OAuth, and password reset

---

## ✅ Features
### ✔️ Completed

---

#### 🔐 Authentication & Authorization

* ✔️ JWT access & refresh token system with unique `jti` per token
* ✔️ Token revocation via JTI blacklist model — revoke individual or all sessions
* ✔️ Auth middleware — authentication, authorization, and combined variants
* ✔️ Google OAuth — unified signup/login flow, no password required
* ✔️ OTP email verification with nanoid + 2-min expiry, dispatched via Node EventEmitter

  **📧 Email Preview — OTP / Confirm Email**

  > The following email is sent to the user upon signup to verify their email address.

  [![OTP Verification Email](https://drive.google.com/thumbnail?id=1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f&sz=w600)](https://drive.google.com/file/d/1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f/view?usp=sharing)

* ✔️ Forget password — 3-step OTP-based reset flow (request → verify → reset)

  **📧 Email Preview — Password Reset**

  > The following email is sent when a user requests a password reset.

  [![Password Reset Email](https://drive.google.com/thumbnail?id=1CJAQzEyuI33c8Kftqd4VgE84uZ6nuB-Y&sz=w600)](https://drive.google.com/file/d/1CJAQzEyuI33c8Kftqd4VgE84uZ6nuB-Y/view?usp=sharing)

* ✔️ Refresh token endpoint — rotates access & refresh token pair
* ✔️ Logout — single session (JTI blacklist) or all sessions (`changeCredentialsTime`)

---

#### 👤 User Profile Management

* ✔️ Get profile — authenticated; phone number AES-decrypted on fetch
* ✔️ Update profile — name, phone, gender
* ✔️ Change password — with `stayLoggedIn`, `logout`, or `logoutFromAll` flag
* ✔️ Profile image upload via Cloudinary — auto-replaces old image on update
* ✔️ Cover images upload via Cloudinary — up to 2 images, all replaced on update

  **🖼️ Cloudinary Preview — Profile Image & Cover Images**

  > The image below shows an example of a profile image and cover images uploaded and served via Cloudinary.

  [![Profile & Cover Images on Cloudinary](https://drive.google.com/thumbnail?id=19LoatLss1WMcPWciqdty8W1pn2REHPKj&sz=w600)](https://drive.google.com/file/d/19LoatLss1WMcPWciqdty8W1pn2REHPKj/view?usp=sharing)

* ✔️ Public share profile — view limited public fields by `userId`

---

#### 🛡️ Security & Privacy

* ✔️ bcrypt password hashing with reuse prevention via `oldPasswords` array
* ✔️ AES field encryption — phone numbers encrypted at rest
* ✔️ Centralized Joi validation middleware across all routes
* ✔️ CORS configured globally via `cors()` middleware
* ✔️ Helmet — sets secure HTTP response headers to protect against common web vulnerabilities
* ✔️ Rate limiting via `express-rate-limit` — 2,000 requests / hour per IP; returns `429` with a JSON error on breach; uses `draft-8` standard headers

---

#### 🏗️ Architecture & Infrastructure

* ✔️ Modular project structure — auth, user, DB, middleware, and utils fully separated
* ✔️ Global async error handler with uniform JSON responses across all routes
* ✔️ Chalk-powered server startup log — colored `Server is running on port 🚀` console output

---

#### 👨‍💼 Admin Controls

* ✔️ Account soft-delete (freeze) — users can freeze own; admins can target any user
* ✔️ Account restore — admin only
* ✔️ Hard delete — admin only; account must be frozen first (`deletedAt` must exist)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access & refresh tokens), Google OAuth |
| Security | bcryptjs, CryptoJS (AES), CORS, Helmet, express-rate-limit |
| Validation | Joi |
| Email | Nodemailer + Node EventEmitter |
| File Upload | Multer (local & Cloudinary) |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |
| Logging | Chalk |

---

## Project Structure

```
SARAHAA-APP/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   └── user/
│   │       ├── user.controller.js
│   │       ├── user.routes.js
│   │       ├── user.validation.js
│   │       └── user.authorization.js
│   ├── DB/
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── token.model.js
│   │   │   └── message.model.js
│   │   ├── db.service.js
│   │   └── connection.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   └── utils/
│       ├── response.js
│       ├── multer/
│       │   ├── local.multer.js
│       │   ├── cloud.multer.js
│       │   └── cloudinary.js
│       ├── email/
│       │   ├── send.email.js
│       │   └── templates/
│       │       └── Email.template.js
│       ├── events/
│       │   └── email.event.js
│       └── security/
│           ├── hash.security.js
│           ├── encrypt.security.js
│           ├── otp.security.js
│           └── token.security.js
│   ├── app.controller.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Database Models

### User — `src/DB/models/user.model.js`

| Field | Type | Notes |
|---|---|---|
| `firstName` / `lastName` | String | Required · 2–20 chars each |
| `fullName` | Virtual | Getter/setter splitting first & last name |
| `email` | String | Required · Unique |
| `password` | String | Required for `system` provider · bcrypt hashed |
| `oldPasswords` | [String] | Prevents password reuse |
| `phone` | String | Required for `system` provider · AES encrypted |
| `gender` | String | `male` / `female` · Default: `male` |
| `role` | String | `user` / `admin` · Default: `user` |
| `provider` | String | `system` / `google` · Default: `system` |
| `picture` | Object | `{ secure_url, public_id }` — Cloudinary |
| `coverImages` | [Object] | Array of `{ secure_url, public_id }` — Cloudinary |
| `confirmEmail` | Date | Set on verification · absent = unverified |
| `confirmEmailOtp` | String | Hashed · removed after verification |
| `forgetPasswordOtp` | String | Hashed · removed after reset |
| `otpDate` | Date | OTP timestamp — drives 2-min expiry logic |
| `changeCredentialsTime` | Date | Updated on password reset / logout-all · invalidates all prior tokens |
| `deletedAt` / `deletedBy` | Date / ObjectId | Soft-delete fields |
| `restoredAt` / `restoredBy` | Date / ObjectId | Restore audit fields |
| `messages` | Virtual | Populates received messages via `Message.receiverId` — `justOne: false` |

---

### Token (Blacklist) — `src/DB/models/token.model.js`

Stores revoked JWT IDs. Every authenticated request checks this collection before proceeding.

| Field | Type | Notes |
|---|---|---|
| `jti` | String | Required · Unique — JWT ID from token payload |
| `expiresIn` | Number | Unix timestamp — for future TTL cleanup |
| `userId` | ObjectId | Required · Ref: `User` |

---

### Message — `src/DB/models/message.model.js`

Stores anonymous (or identified) messages sent to a user's public profile link.

| Field | Type | Notes |
|---|---|---|
| `content` | String | 2–20,000 chars · Required only when `attachments` is empty |
| `attachments` | [Object] | Array of `{ secure_url, public_id }` — Cloudinary |
| `receiverId` | ObjectId | Required · Ref: `User` — the message recipient |
| `senderId` | ObjectId | Optional · Ref: `User` — absent when sent anonymously |
| `deletedAt` / `deletedBy` | Date / ObjectId | Soft-delete fields |
| `restoredAt` / `restoredBy` | Date / ObjectId | Restore audit fields |

---

## Security Design

- **Passwords** — bcrypt hashed; previous passwords stored to prevent reuse
- **Phone numbers** — AES encrypted at rest, decrypted only on profile fetch
- **OTPs** — bcrypt hashed with a 2-minute expiry window; cooldown enforced on resend
- **JWT** — Access + refresh token pair. Each token carries a unique `jti` (via nanoid). On logout, the `jti` is blacklisted in the Token collection. `changeCredentialsTime` on the user provides global session invalidation (logout from all devices).
- **Google OAuth** — ID token verified server-side via `google-auth-library`; unified signup/login — no password required
- **Helmet** — applies a suite of secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.) on every response
- **Rate Limiting** — `express-rate-limit` caps each IP at 2,000 requests per hour; excess requests are rejected with `429 Too Many Requests` and a JSON body; standard `RateLimit-*` headers (`draft-8`) are sent on every response

---

## API Reference

**Base URL:** `http://localhost:5000`

> 🔒 Protected routes require `Authorization: Bearer <token>` or `Authorization: Admin <token>`
>
> All routes return `400 Validation Error` on invalid input — omitted per endpoint for brevity.

---

### Auth — `/auth`

<details>
<summary><code>POST</code> &nbsp; <code>/auth/signup</code> &nbsp;—&nbsp; Register a new user</summary>

<br>

**Body**
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

**Validation**

| Field | Rules |
|---|---|
| `fullName` | Required · first + last name · each part 2–20 chars |
| `email` | Required · valid TLD: `com / net / org / io / gov / edu` |
| `password` | Required · min 8 chars · uppercase, lowercase, digit, special char |
| `phone` | Required · Egyptian numbers only: `010 / 011 / 012 / 015` |
| `gender` | Optional · `male` or `female` |
| `role` | Optional · `user` or `admin` |

**Responses**

| Status | Description |
|---|---|
| `201` | User created — OTP sent to email |
| `409` | Email already registered |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/auth/login</code> &nbsp;—&nbsp; Login with credentials</summary>

<br>

**Body**
```json
{
  "email": "ahmed@example.com",
  "password": "Ahmed@1234"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Login successful — returns `access_token` and `refresh_token` |
| `401` | Email not verified |
| `401` | Account is frozen |
| `404` | Invalid email or password |

> Token prefix is `Bearer` for users and `Admin` for admins — resolved automatically from user role.

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/auth/gmail</code> &nbsp;—&nbsp; Signup or login with Google</summary>

<br>

**Body**
```json
{ "idToken": "<google_id_token>" }
```

**Responses**

| Status | Description |
|---|---|
| `201` | New account created via Google |
| `200` | Existing Google user logged in |
| `401` | Google email not verified |
| `409` | Email already registered under `system` provider |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/confirm-email</code> &nbsp;—&nbsp; Verify email with OTP</summary>

<br>

**Body**
```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | Email verified |
| `400` | Invalid OTP |
| `400` | OTP expired (older than 2 minutes) |
| `404` | Email not found or already verified |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/resend-otp</code> &nbsp;—&nbsp; Resend verification OTP</summary>

<br>

**Body**
```json
{ "email": "ahmed@example.com" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | OTP resent |
| `400` | Within 2-min cooldown — returns seconds remaining |
| `404` | Email not found or already confirmed |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/forget-password</code> &nbsp;—&nbsp; Request password reset OTP</summary>

<br>

**Body**
```json
{ "email": "ahmed@example.com" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | Reset OTP sent to email |
| `404` | Email not found, unverified, or Google account |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/verify-forget-password</code> &nbsp;—&nbsp; Verify reset OTP</summary>

<br>

**Body**
```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | OTP verified — proceed to reset password |
| `400` | Invalid OTP |
| `404` | Email not found or no active reset request |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/reset-password</code> &nbsp;—&nbsp; Set new password</summary>

<br>

**Body**
```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "password": "NewPass@5678"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Password reset — all existing sessions invalidated |
| `400` | Invalid OTP |
| `404` | Email not found or no active reset request |

> `changeCredentialsTime` is updated on success, immediately invalidating all previously issued tokens.

</details>

---

### User — `/user`

<details>
<summary><code>GET</code> &nbsp; <code>/user</code> &nbsp;—&nbsp; Get current user profile &nbsp; 🔒</summary>

<br>

Returns the authenticated user's profile. Phone number is decrypted before returning.

**Responses**

| Status | Description |
|---|---|
| `200` | Profile returned |
| `401` | Missing, revoked, or expired token |
| `403` | Role not permitted |
| `404` | User not found |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user</code> &nbsp;—&nbsp; Update basic profile &nbsp; 🔒</summary>

<br>

**Body** *(all fields optional)*
```json
{
  "fullName": "Ahmed Updated",
  "phone": "01112345678",
  "gender": "male"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Profile updated |
| `401` | Invalid or revoked token |
| `404` | User not found |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user/password</code> &nbsp;—&nbsp; Update password &nbsp; 🔒</summary>

<br>

**Body**
```json
{
  "oldPassword": "Ahmed@1234",
  "newPassword": "NewPass@5678",
  "flag": "stayLoggedIn"
}
```

| `flag` | Behavior |
|---|---|
| `stayLoggedIn` | Default — stay authenticated |
| `logout` | Revoke current session token |
| `logoutFromAll` | Invalidate all active sessions |

**Responses**

| Status | Description |
|---|---|
| `200` | Password updated |
| `400` | Old password doesn't match |
| `401` | Invalid or revoked token |
| `404` | User not found |
| `409` | New password matches a previously used password |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user/profile-image</code> &nbsp;—&nbsp; Upload profile image &nbsp; 🔒</summary>

<br>

**Content-Type:** `multipart/form-data`  
**Field:** `image` — single file · accepted: `image/jpeg`, `image/gif`

Replaces the existing profile image on Cloudinary if one exists.

**Responses**

| Status | Description |
|---|---|
| `200` | Image uploaded |
| `400` | Invalid file type |
| `401` | Invalid or revoked token |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user/profile-cover-images</code> &nbsp;—&nbsp; Upload cover images &nbsp; 🔒</summary>

<br>

**Content-Type:** `multipart/form-data`  
**Field:** `images` — 1–2 files · accepted: `image/jpeg`, `image/gif`

Replaces all existing cover images on Cloudinary.

**Responses**

| Status | Description |
|---|---|
| `200` | Cover images uploaded |
| `400` | Invalid file type |
| `401` | Invalid or revoked token |

</details>

---

<details>
<summary><code>GET</code> &nbsp; <code>/user/refresh-token</code> &nbsp;—&nbsp; Rotate token pair &nbsp; 🔒</summary>

<br>

**Header:** `Authorization: Bearer <refresh_token>` or `Authorization: Admin <refresh_token>`

**Responses**

| Status | Description |
|---|---|
| `200` | New `access_token` and `refresh_token` returned |
| `401` | Invalid or revoked refresh token |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/user/logout</code> &nbsp;—&nbsp; Logout &nbsp; 🔒</summary>

<br>

**Body**
```json
{ "flag": "logout" }
```

| `flag` | Behavior |
|---|---|
| `logout` | Revokes current token via JTI blacklist |
| `logoutFromAll` | Sets `changeCredentialsTime` — invalidates all active sessions |

**Responses**

| Status | Description |
|---|---|
| `201` | Logged out |
| `401` | Invalid or revoked token |

</details>

---

<details>
<summary><code>GET</code> &nbsp; <code>/user/:userId</code> &nbsp;—&nbsp; View public profile</summary>

<br>

**Params:** `userId` — valid MongoDB ObjectId

Returns limited public fields: `firstName`, `lastName`, `fullName`, `email`.

**Responses**

| Status | Description |
|---|---|
| `200` | Public profile returned |
| `400` | Invalid ObjectId |
| `404` | Account not found or not verified |

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <code>/user/:userId/freeze-account</code> &nbsp;—&nbsp; Soft-delete (freeze) account &nbsp; 🔒</summary>

<br>

Users can freeze their own account (omit `userId`). Admins can target any user by passing `userId`.

**Responses**

| Status | Description |
|---|---|
| `204` | Account frozen |
| `401` | Invalid or revoked token |
| `403` | Non-admin attempting to freeze another user |
| `404` | User not found or already frozen |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user/:userId/restore-account</code> &nbsp;—&nbsp; Restore frozen account &nbsp; 🔒 Admin</summary>

<br>

**Header:** `Authorization: Admin <access_token>`  
**Params:** `userId` — valid MongoDB ObjectId

**Responses**

| Status | Description |
|---|---|
| `200` | Account restored |
| `401` | Invalid or revoked token |
| `403` | Not an admin |
| `404` | User not found or already active |

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <code>/user/:userId</code> &nbsp;—&nbsp; Hard delete account &nbsp; 🔒 Admin</summary>

<br>

**Header:** `Authorization: Admin <access_token>`  
**Params:** `userId` — valid MongoDB ObjectId

> Account must be frozen first (`deletedAt` must exist). Active accounts cannot be hard-deleted directly.

**Responses**

| Status | Description |
|---|---|
| `204` | Account permanently deleted |
| `401` | Invalid or revoked token |
| `403` | Not an admin |
| `404` | User not found or not frozen |

</details>

---

## Roadmap

- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Block / report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer
📩 ahmedezsam@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with focus, coffee, and clean architecture principles ☕</sub>
</div>
