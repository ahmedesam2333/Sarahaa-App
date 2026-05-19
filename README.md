<div align="center">

<h1>🕵️ Sarahaa App</h1>
<p><strong>Anonymous Messaging Platform — REST API Backend</strong></p>

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

## Overview

Sarahaa is an anonymous messaging platform where users share a public link and receive messages from anyone — without the sender revealing their identity.

**Core flow:**
- Users register and receive a personal public link
- Anyone (authenticated or not) can send an anonymous message via that link
- Users view, manage, and reply to messages — replies are public, senders stay anonymous
- Full auth system: email OTP verification, Google OAuth, and password reset

---

## Features

| # | Feature |
|---|---|
| 1 | Modular project structure |
| 2 | Global async error handler + uniform JSON responses |
| 3 | bcrypt password hashing with reuse prevention |
| 4 | AES encryption on sensitive fields (phone) |
| 5 | nanoid OTP generation with 2-min expiry |
| 6 | JWT access & refresh token system with `jti` tracking |
| 7 | Token revocation via JTI blacklist model |
| 8 | Auth middleware — authentication, authorization, combined |
| 9 | Centralized Joi validation middleware |
| 10 | CORS configured for specific origins |
| 11 | Google OAuth — unified signup/login |
| 12 | OTP email verification with EventEmitter |
| 13 | Forget password — 3-step OTP reset flow |
| 14 | User profile — get, update, change password |
| 15 | Profile image upload (Cloudinary) — replaces old on update |
| 16 | Cover images upload — up to 2 (Cloudinary) |
| 17 | Account soft-delete (freeze) & restore |
| 18 | Hard delete — admin only |
| 19 | Public share profile by userId |
| 20 | Refresh token endpoint |
| 21 | Logout — single session or all sessions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access & refresh tokens), Google OAuth |
| Security | bcryptjs, CryptoJS (AES), CORS |
| Validation | Joi |
| Email | Nodemailer + Node EventEmitter |
| File Upload | Multer (local & Cloudinary) |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |

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
│   │   │   └── token.model.js
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

---

### Token (Blacklist) — `src/DB/models/token.model.js`

Stores revoked JWT IDs. Every authenticated request checks this collection before proceeding.

| Field | Type | Notes |
|---|---|---|
| `jti` | String | Required · Unique — JWT ID from token payload |
| `expiresIn` | Number | Unix timestamp — for future TTL cleanup |
| `userId` | ObjectId | Required · Ref: `User` |

---

## Security Design

- **Passwords** — bcrypt hashed; previous passwords stored to prevent reuse
- **Phone numbers** — AES encrypted at rest, decrypted only on profile fetch
- **OTPs** — bcrypt hashed with a 2-minute expiry window; cooldown enforced on resend
- **JWT** — Access + refresh token pair. Each token carries a unique `jti` (via nanoid). On logout, the `jti` is blacklisted in the Token collection. `changeCredentialsTime` on the user provides global session invalidation (logout from all devices).
- **Google OAuth** — ID token verified server-side via `google-auth-library`; unified signup/login — no password required

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

- [ ] Rate limiting per IP (`express-rate-limit`)
- [ ] Helmet security headers
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
