<div align="center">

# 🕵️ Sarahaa App

**Anonymous Messaging Platform — REST API Backend**

![Status](https://img.shields.io/badge/Status-Completed-22c55e?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

<br/>

> A secure, scalable backend for an anonymous social messaging platform.
> Users share a public link and receive messages from anyone — senders stay anonymous by default, with full authentication, privacy controls, and hardened API security.

**Live URLs**

| Protocol | URL |
|---|---|
| HTTP | [http://ec2-32-192-124-255.compute-1.amazonaws.com](http://ec2-32-192-124-255.compute-1.amazonaws.com) |
| HTTPS | [https://bagged-feeble-handcraft.ngrok-free.dev](https://bagged-feeble-handcraft.ngrok-free.dev) |

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
  - [Message — `/message`](#message----message)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

Sarahaa is an anonymous messaging platform where users register, get a personal public profile link, and receive messages from anyone on the internet — without revealing the sender's identity.

**Core flow:**

1. A user registers and verifies their email via OTP
2. Their public profile link becomes accessible by anyone
3. Anyone (authenticated or not) can send an anonymous message through that link
4. The recipient views, manages, and can reply to messages — senders remain anonymous
5. Admins have elevated controls for account management and moderation

---

## Features

### 🔐 Authentication & Authorization

- JWT access and refresh token system with a unique `jti` per token
- Token revocation via a JTI blacklist — revoke a single session or all sessions at once
- Authentication, authorization, and combined middleware variants
- Google OAuth — unified signup/login flow, no password required
- Email OTP verification using nanoid with a 2-minute expiry, dispatched asynchronously via Node EventEmitter

  **Email Preview — OTP Verification**

  > Sent to the user upon signup to verify their email address.

  [![OTP Verification Email](https://drive.google.com/thumbnail?id=1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f&sz=w600)](https://drive.google.com/file/d/1wR2hoSEDwMcPIjyrXYfJZNaVFKIR5W6f/view?usp=sharing)

- 3-step OTP-based password reset flow: request → verify → reset

  **Email Preview — Password Reset**

  > Sent when a user requests a password reset.

  [![Password Reset Email](https://drive.google.com/thumbnail?id=1CJAQzEyuI33c8Kftqd4VgE84uZ6nuB-Y&sz=w600)](https://drive.google.com/file/d/1CJAQzEyuI33c8Kftqd4VgE84uZ6nuB-Y/view?usp=sharing)

- Refresh token endpoint — rotates both the access and refresh token on each call
- Logout with two modes: single session (JTI blacklist) or all sessions (`changeCredentialsTime`)

---

### 👤 User Profile Management

- Get profile — authenticated; phone number is AES-decrypted before returning
- Update profile fields: name, phone, gender
- Change password — supports `stayLoggedIn`, `logout`, or `logoutFromAll` behavior
- Profile image upload via Cloudinary — automatically replaces the previous image on update
- Cover images upload via Cloudinary — up to 2 images, fully replaced on update

  **Cloudinary Preview — Profile & Cover Images**

  > An example of profile and cover images stored and served via Cloudinary.

  [![Profile & Cover Images on Cloudinary](https://drive.google.com/thumbnail?id=19LoatLss1WMcPWciqdty8W1pn2REHPKj&sz=w600)](https://drive.google.com/file/d/19LoatLss1WMcPWciqdty8W1pn2REHPKj/view?usp=sharing)

- Public share profile — view a limited set of public fields by `userId`

---

### 💬 Messaging

- Send an anonymous message to any verified user by `receiverId` — no authentication required
- Send a message as an authenticated user (`/sender` route) — `senderId` is stored on the message
- Message attachments — up to 2 images per message uploaded to Cloudinary
- List all received messages — populated via the `messages` virtual on the user model
- Get a single message — accessible by the sender or receiver only
- Freeze message (soft-delete) — receiver only; sets `deletedAt` and `deletedBy`
- Restore a frozen message — receiver only; unsets soft-delete fields and sets restore audit fields
- Hard delete a message — receiver only; message must be frozen first

---

### 👨‍💼 Admin Controls

- Account soft-delete (freeze) — users can freeze their own account; admins can target any user
- Account restore — admin only
- Hard delete — admin only; account must be frozen first (`deletedAt` must exist)

---

### 🛡️ Security & Privacy

- Password hashing with bcrypt; previous passwords stored to prevent reuse
- AES field encryption — phone numbers encrypted at rest, decrypted only on fetch
- Centralized Joi validation middleware applied across all routes
- CORS configured globally via `cors()` middleware
- Helmet — sets a suite of secure HTTP response headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting via `express-rate-limit` — 2,000 requests per hour per IP; excess requests return `429 Too Many Requests` with a JSON error body; standard `RateLimit-*` headers (`draft-8`) are sent on every response

---

### 🏗️ Architecture & Infrastructure

- Modular project structure — auth, user, DB, middleware, and utils fully separated
- Global async error handler with uniform JSON responses across all routes
- Chalk-powered server startup log — colored console output with port information

---

### ☁️ Deployment — AWS EC2

The application is deployed on an **AWS EC2** instance with the following production infrastructure:

- **EC2 Instance** — Linux server provisioned on AWS with a public Elastic IP address for a stable, permanent endpoint
- **Security Groups** — Network rules configured to allow inbound traffic on HTTP (port 80) and HTTPS (port 443), plus SSH (port 22) for remote access
- **Elastic IP** — A static IP attached to the instance, ensuring the server address does not change on restart
- **Nginx** — Installed and configured as a reverse proxy; routes incoming HTTP/HTTPS traffic to the Node.js application running on its internal port
- **PM2 Cluster Mode** — The app runs under PM2 in cluster mode, utilizing all available CPU cores, with automatic restarts on crash and persistence across server reboots
- **ngrok** — Provides a public HTTPS tunnel to the server for the secure URL

  **AWS Configuration Screenshots**

  > The images below show the EC2 instance, security group rules, Elastic IP, and server configuration.

  [![AWS EC2 Configuration](https://drive.google.com/thumbnail?id=1i1yinEb5YVaMaLin9BbOB00DDF0R9pR_&sz=w600)](https://drive.google.com/drive/folders/1i1yinEb5YVaMaLin9BbOB00DDF0R9pR_?usp=sharing)

**Live URLs**

| Protocol | URL |
|---|---|
| HTTP (EC2 + Elastic IP) | [http://ec2-32-192-124-255.compute-1.amazonaws.com](http://ec2-32-192-124-255.compute-1.amazonaws.com) |
| HTTPS (ngrok tunnel) | [https://bagged-feeble-handcraft.ngrok-free.dev](https://bagged-feeble-handcraft.ngrok-free.dev) |

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
| File Upload | Multer + Cloudinary |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |
| Logging | Chalk |
| Process Manager | PM2 (cluster mode) |
| Web Server | Nginx (reverse proxy) |
| Cloud Infrastructure | AWS EC2, Elastic IP |
| HTTPS Tunnel | ngrok |

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
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.routes.js
│   │   │   ├── user.validation.js
│   │   │   └── user.authorization.js
│   │   └── message/
│   │       ├── message.controller.js
│   │       ├── message.routes.js
│   │       └── message.validation.js
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
| `fullName` | Virtual | Getter/setter that splits first and last name |
| `email` | String | Required · Unique |
| `password` | String | Required for `system` provider · bcrypt hashed |
| `oldPasswords` | [String] | Stores previous hashed passwords to prevent reuse |
| `phone` | String | Required for `system` provider · AES encrypted at rest |
| `gender` | String | `male` / `female` · Default: `male` |
| `role` | String | `user` / `admin` · Default: `user` |
| `provider` | String | `system` / `google` · Default: `system` |
| `picture` | Object | `{ secure_url, public_id }` — Cloudinary |
| `coverImages` | [Object] | Array of `{ secure_url, public_id }` — Cloudinary |
| `confirmEmail` | Date | Set on verification; absent means unverified |
| `confirmEmailOtp` | String | Hashed · removed after verification |
| `forgetPasswordOtp` | String | Hashed · removed after reset |
| `otpDate` | Date | OTP timestamp — drives the 2-minute expiry logic |
| `changeCredentialsTime` | Date | Updated on password reset / logout-all · invalidates all prior tokens |
| `deletedAt` / `deletedBy` | Date / ObjectId | Soft-delete fields |
| `restoredAt` / `restoredBy` | Date / ObjectId | Restore audit fields |
| `messages` | Virtual | Populates received messages via `Message.receiverId` |

---

### Token Blacklist — `src/DB/models/token.model.js`

Stores revoked JWT IDs. Every authenticated request checks this collection before proceeding.

| Field | Type | Notes |
|---|---|---|
| `jti` | String | Required · Unique — JWT ID from the token payload |
| `expiresIn` | Number | Unix timestamp — for future TTL cleanup |
| `userId` | ObjectId | Required · Ref: `User` |

---

### Message — `src/DB/models/message.model.js`

Stores anonymous (or identified) messages sent to a user's public profile.

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
- **OTPs** — bcrypt hashed with a 2-minute expiry; resend cooldown enforced
- **JWT** — Access and refresh token pair. Each token carries a unique `jti` (via nanoid). On logout, the `jti` is blacklisted in the Token collection. `changeCredentialsTime` on the User model provides global session invalidation (logout from all devices).
- **Google OAuth** — ID token verified server-side via `google-auth-library`; unified signup/login flow with no password required
- **Helmet** — applies a full suite of secure HTTP headers on every response
- **Rate Limiting** — `express-rate-limit` caps each IP at 2,000 requests per hour; excess requests are rejected with `429 Too Many Requests` plus a JSON error body; standard `RateLimit-*` headers (`draft-8`) are sent on every response

---

## API Reference

**Base URL (HTTP):** `http://ec2-32-192-124-255.compute-1.amazonaws.com`

**Base URL (HTTPS):** `https://bagged-feeble-handcraft.ngrok-free.dev`

> 🔒 Protected routes require `Authorization: Bearer <token>` (users) or `Authorization: Admin <token>` (admins)
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

> Token prefix is `Bearer` for users and `Admin` for admins — resolved automatically from the user's role.

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
| `200` | Existing Google account logged in |
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
| `404` | Email not found, unverified, or a Google account |

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
<summary><code>PATCH</code> &nbsp; <code>/auth/reset-password</code> &nbsp;—&nbsp; Set a new password</summary>

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

Returns the authenticated user's profile. Phone number is AES-decrypted before returning.

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
<summary><code>PATCH</code> &nbsp; <code>/user/password</code> &nbsp;—&nbsp; Change password &nbsp; 🔒</summary>

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
| `stayLoggedIn` | Default — remain authenticated after change |
| `logout` | Revoke the current session token |
| `logoutFromAll` | Invalidate all active sessions across all devices |

**Responses**

| Status | Description |
|---|---|
| `200` | Password updated |
| `400` | Old password does not match |
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
| `logout` | Revokes the current token via JTI blacklist |
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
<summary><code>DELETE</code> &nbsp; <code>/user/:userId/freeze-account</code> &nbsp;—&nbsp; Freeze account (soft-delete) &nbsp; 🔒</summary>

<br>

Users can freeze their own account. Admins can target any user by providing `userId`.

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

### Message — `/message`

<details>
<summary><code>POST</code> &nbsp; <code>/message/:receiverId</code> &nbsp;—&nbsp; Send anonymous message</summary>

<br>

No authentication required. Anyone can send a message to a verified user's public profile.

**Params:** `receiverId` — valid MongoDB ObjectId

**Content-Type:** `multipart/form-data`

| Field | Rules |
|---|---|
| `content` | String · 2–20,000 chars · Required if no attachments provided |
| `attachments` | 0–2 image files (`image/jpeg`, `image/gif`) · Optional |

**Responses**

| Status | Description |
|---|---|
| `201` | Message sent |
| `400` | No content and no attachments provided |
| `404` | Receiver not found or account not verified |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/message/:receiverId/sender</code> &nbsp;—&nbsp; Send message as authenticated user &nbsp; 🔒</summary>

<br>

Same as anonymous send but requires a valid token — `senderId` is stored on the message document.

**Params:** `receiverId` — valid MongoDB ObjectId

**Content-Type:** `multipart/form-data`

| Field | Rules |
|---|---|
| `content` | String · 2–20,000 chars · Required if no attachments provided |
| `attachments` | 0–2 image files (`image/jpeg`, `image/gif`) · Optional |

**Responses**

| Status | Description |
|---|---|
| `201` | Message sent |
| `400` | No content and no attachments provided |
| `401` | Invalid or revoked token |
| `404` | Receiver not found or account not verified |

</details>

---

<details>
<summary><code>GET</code> &nbsp; <code>/message</code> &nbsp;—&nbsp; List all received messages &nbsp; 🔒</summary>

<br>

Returns all messages received by the authenticated user, populated via the `messages` virtual on the user model.

**Responses**

| Status | Description |
|---|---|
| `200` | Messages returned |
| `401` | Invalid or revoked token |

</details>

---

<details>
<summary><code>GET</code> &nbsp; <code>/message/:messageId</code> &nbsp;—&nbsp; Get a single message &nbsp; 🔒</summary>

<br>

**Params:** `messageId` — valid MongoDB ObjectId

Accessible only by the sender or receiver. Soft-deleted messages are excluded.

**Responses**

| Status | Description |
|---|---|
| `200` | Message returned |
| `401` | Invalid or revoked token |
| `404` | Message not found or access denied |

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <code>/message/freeze-message/:messageId</code> &nbsp;—&nbsp; Freeze message (soft-delete) &nbsp; 🔒</summary>

<br>

**Params:** `messageId` — valid MongoDB ObjectId

Receiver only. Sets `deletedAt` and `deletedBy` — the message is hidden but not permanently removed.

**Responses**

| Status | Description |
|---|---|
| `204` | Message frozen |
| `401` | Invalid or revoked token |
| `404` | Message not found or already frozen |

</details>

---

<details>
<summary><code>DELETE</code> &nbsp; <code>/message/delete-message/:messageId</code> &nbsp;—&nbsp; Hard delete message &nbsp; 🔒</summary>

<br>

**Params:** `messageId` — valid MongoDB ObjectId

Receiver only. Message must be frozen first (`deletedAt` must exist). Permanently removes the document.

**Responses**

| Status | Description |
|---|---|
| `204` | Message permanently deleted |
| `401` | Invalid or revoked token |
| `404` | Message not found or not frozen |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/message/restore-message/:messageId</code> &nbsp;—&nbsp; Restore frozen message &nbsp; 🔒</summary>

<br>

**Params:** `messageId` — valid MongoDB ObjectId

Receiver only (must be the user who froze it — `deletedBy` must match). Unsets soft-delete fields and records `restoredAt` / `restoredBy`.

**Responses**

| Status | Description |
|---|---|
| `200` | Message restored |
| `401` | Invalid or revoked token |
| `404` | Message not found or already restored |

</details>

---

## Deployment

The application is hosted on an **AWS EC2** Linux instance with the following production setup:

> **Deployed:** May 20, 2025 · Hosted on the AWS Free Tier (12-month) — instance active until approximately **November 20, 2025**

**Infrastructure**

- Elastic IP assigned to the instance for a stable, permanent public address
- Security group configured to allow inbound traffic on ports 80 (HTTP), 443 (HTTPS), and 22 (SSH)
- Nginx installed as a reverse proxy, routing public traffic to the Node.js app on its internal port
- PM2 running in cluster mode — utilizes all CPU cores, auto-restarts on crash, and survives server reboots
- ngrok providing a public HTTPS tunnel for the secure endpoint

> **Note:** The HTTPS URL uses ngrok's free tier and may change. Always refer to the latest README for the current URL.

**Configuration Screenshots**

> AWS EC2 instance, security groups, Elastic IP, and server setup — [view all screenshots](https://drive.google.com/drive/folders/1i1yinEb5YVaMaLin9BbOB00DDF0R9pR_?usp=sharing)

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with focus, coffee, and clean architecture principles ☕</sub>
</div>
